window.bluentDemo = {
    isNarrowViewport() {
        return window.matchMedia("(max-width: 720px)").matches;
    },
    scrollToTop(element) {
        element?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
};
