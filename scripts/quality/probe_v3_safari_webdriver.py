#!/usr/bin/env python3
"""#418 opt-in Dialog smoke in real Safari/WebKit via W3C WebDriver.

Start safaridriver -p 4444 and a published InteractiveServer Bluent v3 app.
This proves browser DOM and native keyboard events, NOT VoiceOver speech.
"""
import argparse
import json
import time
from urllib.request import Request, urlopen

E = "element-6066-11e4-a52e-4f735466cecf"
TAB, ESC, SHIFT = "\ue004", "\ue00c", "\ue008"


def request(url, data=None, method=None):
    req = Request(url, data=json.dumps(data).encode() if data is not None else None,
                  headers={"Content-Type": "application/json"}, method=method)
    with urlopen(req, timeout=35) as reply:
        result = json.load(reply)["value"]
    if isinstance(result, dict) and result.get("error"):
        raise RuntimeError(str(result))
    return result


def run(driver, base):
    session = request(driver + "/session",
                      {"capabilities": {"alwaysMatch": {"browserName": "safari"}}})["sessionId"]
    path = driver + "/session/" + session
    checks = []

    def send(route, data=None):
        return request(path + route, data)

    def js(code):
        return send("/execute/sync", {"script": code, "args": []})

    def wait(code, name):
        until = time.monotonic() + 27
        while time.monotonic() < until:
            result = js(code)
            if result:
                return result
            time.sleep(0.45)
        raise AssertionError("Timed out: " + name)

    def click(css):
        el = send("/element", {"using": "css selector", "value": css})
        send("/element/" + el[E] + "/click", {})

    def key(code, shift=False):
        a = ([{"type": "keyDown", "value": SHIFT}] if shift else [])
        a += [{"type": "keyDown", "value": code}, {"type": "keyUp", "value": code}]
        if shift:
            a.append({"type": "keyUp", "value": SHIFT})
        send("/actions", {"actions": [{"type": "key", "id": "qa", "actions": a}]})

    def check(name, test):
        if not test:
            raise AssertionError("FAILED: " + name)
        checks.append(name)
        print("PASS", len(checks), name, flush=True)

    try:
        send("/url", {"url": base.rstrip("/") + "/v3/interactive-portal-lab"})
        wait("return !!document.querySelector('#v3-show-keyboard-modal')", "real lab")
        check("published Blazor lab renders", bool(js("return !!document.querySelector('.v3-lab')")))
        first = js("return document.querySelector('.v3-lab-controls button').textContent.trim()")
        for _ in range(6):
            click(".v3-lab-controls button")
            time.sleep(1)
            if js("return document.querySelector('.v3-lab-controls button').textContent.trim()") != first:
                break
        check("actual Blazor event roundtrip", js("return document.querySelector('.v3-lab-controls button').textContent.trim()") != first)
        click("#v3-show-keyboard-modal")
        m = wait("""let d=document.querySelector('.dialog-wrapper .bui-dialog');
            return d?.hasAttribute('data-bui-v3-keyboard-bound')?{
            role:d.getAttribute('role'),modal:d.getAttribute('aria-modal'),focus:document.activeElement===d}:null""",
            "named opt-in Modal")
        check("named aria-modal dialog", m["role"] == "dialog" and m["modal"] == "true")
        check("initial modal focus", m["focus"])
        key(TAB)
        check("Tab stays inside Dialog", js("return !!document.activeElement?.closest('.bui-dialog')"))
        key(TAB, True)
        check("Shift+Tab wraps to last button", js("return document.activeElement?.id==='v3-modal-last-0'"))
        key(ESC)
        check("Escape and launcher focus restore",
              wait("return !document.querySelector('.dialog-wrapper') && document.activeElement?.id==='v3-show-keyboard-modal'",
                   "Modal close"))
        click("#v3-show-live-title")
        d = wait("""let d=document.querySelector('.dialog-wrapper .bui-dialog'),h=d?.querySelector('h2.title');
            return h?{id:h.id,ref:d.getAttribute('aria-labelledby'),desc:d.querySelector('.bui-v3-dialog-description')?.textContent.trim(),
            focus:document.activeElement?.id}:null""", "title-bearing Dialog")
        check("aria-labelledby resolves visible h2", d["id"] == d["ref"])
        check("visible aria-describedby content", d["desc"] == "Review this person's changes before approving.")
        check("focus is on real TextField", d["focus"] == "v3-live-title-field")
        click("#v3-live-title-update")
        h = wait("""let h=document.querySelector('.dialog-wrapper h2.title');
            return h?.textContent.trim()==='تأیید درخواست - عنوان جدید'?{id:h.id,text:h.textContent.trim()}:null""",
            "Persian live title")
        check("Persian title changes without IDREF replacement", h["id"] == d["id"])
        key(ESC)
        check("dynamic title Dialog restores focus",
              wait("return !document.querySelector('.dialog-wrapper') && document.activeElement?.id==='v3-show-live-title'",
                   "dynamic close"))
        for i in range(3):
            click("#v3-mount-lifecycle-modal")
            wait("return !!document.querySelector('.bui-dialog[data-bui-v3-keyboard-bound] [data-v3-lifecycle-modal]')",
                 "mount")
            click("#v3-unmount-lifecycle-modal")
            check(f"real Dialog unmount {i+1}",
                  wait("return !document.querySelector('[data-v3-lifecycle-modal]')", "unmount"))
        # An actual route transition from INSIDE a service-hosted Dialog.
        # Unlike @if unmount, this destroys the page-local <Containers/>.
        click("#v3-show-route-exit-modal")
        route = wait("""let d=document.querySelector('.dialog-wrapper .bui-dialog');
            return d?.hasAttribute('data-bui-v3-keyboard-bound')&&d.querySelector('#v3-dialog-route-leave')?
            {role:d.getAttribute('role'),focus:document.activeElement===d}:null""",
            "service-hosted route Dialog")
        check("route-local service Dialog receives keyboard ownership",
              route["role"] == "dialog" and route["focus"])
        click("#v3-dialog-route-leave")
        landing = wait("""let d=document.querySelector('[data-v3-route-after-dialog]');
            return d?{path:location.pathname,dialogs:document.querySelectorAll('.dialog-wrapper').length,
            action:!!d.querySelector('#v3-route-after-focus')}:null""",
            "actual cross-route navigation")
        check("navigation destroys old page-local Dialog host",
              landing["path"] == "/v3/route-after-dialog" and landing["dialogs"] == 0 and landing["action"])
        js("document.querySelector('#v3-route-after-focus').focus();return true")
        check("new route focus does not belong to destroyed Modal",
              js("return document.activeElement?.id==='v3-route-after-focus' &&"
                 "!document.activeElement?.closest('.bui-dialog')"))
        return checks
    finally:
        request(path, method="DELETE")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:6143")
    parser.add_argument("--driver", default="http://127.0.0.1:4444")
    args = parser.parse_args()
    successes = run(args.driver, args.base)
    print(json.dumps({"browser": "Safari/WebKit", "host": "published InteractiveServer",
                      "passed": len(successes), "total": len(successes),
                      "nativeVoiceOverSpeechVerified": False}, indent=2))
