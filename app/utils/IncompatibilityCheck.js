export class IncompatibilityCheck {
  constructor(rules) {
    this.rules = rules || [];
  }

  // Bidirectional check: returns true if sourceDO and targetDO are incompatible
  areIncompatible(sourceDO, targetDO) {
    if (!sourceDO || !targetDO) return false;
    return this.rules.some((rule) => {
      // Forward
      const forward =
        sourceDO.startsWith(rule.source.startsWith) &&
        sourceDO.includes(rule.source.has) &&
        targetDO.startsWith(rule.target.startsWith) &&
        targetDO.includes(rule.target.has);
      // Reverse
      const reverse =
        targetDO.startsWith(rule.source.startsWith) &&
        targetDO.includes(rule.source.has) &&
        sourceDO.startsWith(rule.target.startsWith) &&
        sourceDO.includes(rule.target.has);
      return forward || reverse;
    });
  }

  // Returns all DOs from allTargetDOs that are incompatible with sourceDO
  getIncompatibleDOs(sourceDO, allTargetDOs) {
    return allTargetDOs.filter((targetDO) =>
      this.areIncompatible(sourceDO, targetDO)
    );
  }

  // Sorts DOs into compatible and incompatible arrays for a given category and current selection
  sortDOsByCompatibility(allDOs, currentCategory, activePresets) {
    const compatible = [];
    const incompatible = [];
    for (const doName of allDOs) {
      let isCompat = true;
      for (const [cat, selectedDO] of Object.entries(activePresets)) {
        if (cat === currentCategory) continue;
        if (selectedDO && this.areIncompatible(doName, selectedDO)) {
          isCompat = false;
          break;
        }
      }
      if (isCompat) compatible.push(doName);
      else incompatible.push(doName);
    }
    return { compatible, incompatible };
  }

  // Checks if a DO is compatible with all current selections (except its own category)
  isCompatible(category, doName, activePresets) {
    for (const [cat, selectedDO] of Object.entries(activePresets)) {
      if (cat === category) continue;
      if (selectedDO && this.areIncompatible(doName, selectedDO)) {
        return false;
      }
    }
    return true;
  }
}
