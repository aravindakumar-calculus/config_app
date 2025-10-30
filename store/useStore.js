import { create } from "zustand";
import { loadGLB } from "@/app/utils/glbCache";
import { ReferenceMapper } from "@/app/utils/ref_map";

// Updated getReferenceMapper to use Zustand store
async function getReferenceMapper() {
  const { refMap, setRefMap } = useStore.getState();
  if (!refMap) {
    const res = await fetch("/api/ref_map");
    const matrix = await res.json();
    setRefMap(matrix);
    return new ReferenceMapper(matrix);
  }
  return new ReferenceMapper(refMap);
}

export const useStore = create((set, get) => ({
  selectedModel: null,
  modelConfig: {},
  configLoaded: false,

  // --- NEW: ref map state and setter ---
  refMap: null,
  setRefMap: (matrix) => set({ refMap: matrix }),

  setSelectedModel: async (modelName = "MED_TRP_1") => {
    set({ configLoaded: false });
    const currentScene = get().gltfScene;
    if (currentScene) {
      currentScene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose && m.dispose());
          } else {
            child.material.dispose && child.material.dispose();
          }
        }
      });
    }

    let config = {};
    try {
      const res = await fetch(
        `/api/config?name=${encodeURIComponent(modelName)}`
      );
      config = await res.json();
    } catch (e) {
      config = {};
    }

    const modelUrl = config?.modelUrl || "/models/MED_TRP_1.glb";
    await loadGLB(
      modelUrl,
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
    );

    const prevModel = get().selectedModel;
    const prevPresets = get().activeLayerPresets;
    let mappedPresets = {};
    if (prevModel && prevPresets && prevModel !== modelName) {
      // --- Use cached refMap from Zustand ---
      const mapper = await getReferenceMapper();
      mappedPresets = mapper.mapSelections(prevModel, modelName, prevPresets);
    }

    const activeLayerPresets = {};
    if (config.deTabs && config.deOptions) {
      config.deTabs.forEach((tab) => {
        if (tab === "Color") return;
        const options = config.deOptions[tab];
        if (
          mappedPresets[tab] &&
          Array.isArray(options) &&
          options.includes(mappedPresets[tab])
        ) {
          activeLayerPresets[tab] = mappedPresets[tab];
        } else if (Array.isArray(options) && options.length > 0) {
          activeLayerPresets[tab] = options[0];
        }
      });
    }

    let selectedMaterial = null;
    let selectedColor = "#ffffff";
    let colorSelected = false;
    if (config.optionDescriptions?.Color) {
      const colorKeys = Object.keys(config.optionDescriptions.Color);
      if (colorKeys.length > 0) {
        selectedMaterial = colorKeys[0];
        selectedColor = config.colorHex?.[selectedMaterial] || "#ffffff";
        colorSelected = true;
      }
    }

    set({
      selectedModel: modelName,
      modelConfig: config,
      activeLayerPresets,
      selectedTab: config.deTabs?.[0] || null,
      selectedDEOption: null,
      selectedMaterial,
      selectedColor,
      colorSelected,
      productDescription: "",
      incompatibilityRules: null,
      configLoaded: true,
      inventoryData: null,
    });

    set((state) => ({
      visibleParts: state.computeCombinedVisibility(),
    }));
  },

  resetConfigLoaded: () => set({ configLoaded: false }),

  setModelConfig: (config) => set({ modelConfig: config }),
  selectedTab: null,
  selectedDEOption: null,
  activeLayerPresets: {},
  isLoggedIn: false,
  rotationIndex: 0,
  rotationY: 0,
  meshNames: [],
  visibleParts: {},
  selectedMaterial: null,
  selectedColor: "#ffffff",
  colorSelected: false,
  pendingIndex: null,
  selectedPreviewIndex: null,
  gltfScene: null,
  hbIcon: false,
  showProducts: false,
  productDescription: "",
  selectedStitchColor: "black",
  selectedEdgepaintColor: "black",

  toggleHbIcon: () => set((s) => ({ hbIcon: !s.hbIcon })),
  toggleProducts: () => set((s) => ({ showProducts: !s.showProducts })),
  setRotationIndex: (i) => set({ rotationIndex: i }),
  setRotationY: (y) => set({ rotationY: y }),
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
  setSelectedStitchColor: (color) => set({ selectedStitchColor: color }),
  setSelectedEdgepaintColor: (color) => set({ selectedEdgepaintColor: color }),
  setIncompatibilityRules: (rules) => set({ incompatibilityRules: rules }),
  setInventoryData: (data) => set({ inventoryData: data }),

  setMeshNames: (names) =>
    set((state) => {
      const config = state.modelConfig;
      const layerPresets = config?.layerPresets || {};
      const activeLayerPresets = state.activeLayerPresets || {};
      const deTabs = config?.deTabs || [];
      const deOptions = config?.deOptions || {};

      let visibleSet = new Set();

      deTabs.forEach((de) => {
        if (de === "Color") return;
        let opt = activeLayerPresets[de];
        if (!opt && Array.isArray(deOptions[de]) && deOptions[de].length > 0) {
          opt = deOptions[de][0];
        }
        const presetArr = layerPresets?.[de]?.[opt];
        if (Array.isArray(presetArr)) {
          presetArr.forEach((key) => visibleSet.add(key));
        }
      });

      if (visibleSet.size === 0) {
        names.forEach((name) => visibleSet.add(name));
      }

      const visibleParts = Object.fromEntries(
        names.map((name) => [name, visibleSet.has(name)])
      );

      return {
        meshNames: names,
        visibleParts,
      };
    }),

  setSelectedMaterial: (key) => set({ selectedMaterial: key }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setColorSelected: (val) => set({ colorSelected: val }),
  setPendingIndex: (i) => set({ pendingIndex: i }),
  setSelectedPreviewIndex: (i) => set({ selectedPreviewIndex: i }),
  setGltfScene: (scene) => set({ gltfScene: scene }),
  setProductDescription: (desc) => set({ productDescription: desc }),

  setSelectedTab: (tab) =>
    set((state) => {
      const config = state.modelConfig;
      const deOptions = config?.deOptions || {};
      let newActiveLayerPresets = { ...state.activeLayerPresets };
      if (
        tab &&
        tab !== "Color" &&
        deOptions[tab] &&
        deOptions[tab].length > 0 &&
        !newActiveLayerPresets[tab]
      ) {
        newActiveLayerPresets[tab] = deOptions[tab][0];
      }
      return {
        selectedTab: tab,
        selectedDEOption: null,
        activeLayerPresets: newActiveLayerPresets,
      };
    }),

  setSelectedDEOption: (opt) => set({ selectedDEOption: opt }),

  setActiveLayerPreset: (de, opt) =>
    set((state) => {
      const newPresets = {
        ...state.activeLayerPresets,
        [de]: opt,
      };
      const { meshNames, modelConfig } = state;
      const layerPresets = modelConfig?.layerPresets || {};
      const deTabs = modelConfig?.deTabs || [];
      const deOptions = modelConfig?.deOptions || {};

      let visibleSet = new Set();

      deTabs.forEach((tab) => {
        if (tab === "Color") return;
        let selectedOpt = newPresets[tab];
        if (
          !selectedOpt &&
          Array.isArray(deOptions[tab]) &&
          deOptions[tab].length > 0
        ) {
          selectedOpt = deOptions[tab][0];
        }
        const presetArr = layerPresets?.[tab]?.[selectedOpt];
        if (Array.isArray(presetArr)) {
          presetArr.forEach((name) => visibleSet.add(name));
        }
      });

      if (visibleSet.size === 0 && meshNames) {
        meshNames.forEach((name) => visibleSet.add(name));
      }

      const visibleParts = meshNames
        ? Object.fromEntries(
            meshNames.map((name) => [name, visibleSet.has(name)])
          )
        : {};

      return {
        activeLayerPresets: newPresets,
        selectedDEOption: opt,
        visibleParts,
      };
    }),

  setVisibleParts: (parts) => set({ visibleParts: parts }),

  resetVisibleParts: () =>
    set((state) => ({
      visibleParts: state.meshNames.reduce(
        (acc, name) => ({ ...acc, [name]: true }),
        {}
      ),
    })),

  resetToBB: () =>
    set((state) => ({
      visibleParts: state.meshNames.reduce(
        (acc, name) => ({ ...acc, [name]: true }),
        {}
      ),
      activeLayerPresets: {},
      selectedTab: null,
      selectedDEOption: null,
      selectedMaterial: null,
      productDescription: "",
      rotationY: 0,
      rotationIndex: 0,
    })),

  computeCombinedVisibility: () => {
    const { activeLayerPresets, meshNames, modelConfig } = get();
    const layerPresets = modelConfig?.layerPresets || {};
    const deTabs = modelConfig?.deTabs || [];
    const deOptions = modelConfig?.deOptions || {};

    let visibleSet = new Set();

    deTabs.forEach((de) => {
      if (de === "Color") return;
      let opt = activeLayerPresets[de];
      if (!opt && Array.isArray(deOptions[de]) && deOptions[de].length > 0) {
        opt = deOptions[de][0];
      }
      const presetArr = layerPresets?.[de]?.[opt];
      if (Array.isArray(presetArr)) {
        presetArr.forEach((key) => visibleSet.add(key));
      }
    });

    if (visibleSet.size === 0 && meshNames) {
      meshNames.forEach((name) => visibleSet.add(name));
    }

    return meshNames
      ? Object.fromEntries(
          meshNames.map((name) => [name, visibleSet.has(name)])
        )
      : {};
  },
}));

// Export getReferenceMapper for use in other files
export { getReferenceMapper };
