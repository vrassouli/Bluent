# Bluent v3 Skills authoring and routing

The canonical v3 development router is [`.agents/skills/bluent-v3/SKILL.md`](../../../.agents/skills/bluent-v3/SKILL.md). It selects the correct package/version and distinguishes the already-supported 2.x consumer experience from v3 prototype work. There is **no released v3 public API** merely because this Skill exists.

The [component router](../../../.agents/skills/bluent-v3/COMPONENT-ROUTER.md) defines routing by the actual GitHub Project status. The [family Skill template](../../../.agents/skills/bluent-v3/FAMILY-SKILL-TEMPLATE.md) describes the source/demo/a11y/migration evidence required before any individual component-specific Skill is accepted.

These Skills are deliberately short retrieval guides. Detailed and versioned API facts belong in [canonical v3 docs](../README.md) and the [component reference template](../COMPONENT-REFERENCE-TEMPLATE.md); current 2.x APIs remain in [the existing consumer Skill](../../../.agents/skills/bluent/SKILL.md) and [inventory](../../components/inventory.md).

**Design provenance:** editable Bluent v3 Design System Penpot workspace documented under [#419](../design/BLUENT-V3-PENPOT.md); not the upstream Microsoft Fluent kit. **Task:** issue [#423](https://github.com/vrassouli/Bluent/issues/423). Do not infer successful browser tests or production v3 release from a docs/Skill link check.
