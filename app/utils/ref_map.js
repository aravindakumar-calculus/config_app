export class ReferenceMapper {
  constructor(matrix) {
    this.matrix = matrix; // { ref_map, defaults }
  }

  mapSelections(fromModel, toModel, current) {
    const result = {};
    for (const [cat, val] of Object.entries(current)) {
      if (cat === "Style") continue;
      if (cat === "Add-ons" && Array.isArray(val)) {
        result[cat] = val.map((doName) =>
          this.mapOrFallback(doName, toModel, cat)
        );
      } else {
        result[cat] = this.mapOrFallback(val, toModel, cat);
      }
    }
    return result;
  }

  mapOrFallback(doName, toModel, category) {
    const entry = this.matrix.ref_map[doName];
    if (!entry) return this.getDefaultDO(category, toModel);
    const mapped = entry[toModel];
    return mapped == null ? this.getDefaultDO(category, toModel) : mapped;
  }

  getDefaultDO(category, model) {
    // Defensive: check if category and model exist
    const catDefaults = this.matrix.defaults[category];
    if (!catDefaults) {
      console.warn(`No defaults for category: ${category}`);
      return null;
    }
    if (!(model in catDefaults)) {
      console.warn(`No default for model: ${model} in category: ${category}`);
      return null;
    }
    return catDefaults[model];
  }
}
