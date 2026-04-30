/* easy-blogger/lib/articles/workflowConfig.js */

import {
  createDraft,
  updateDraft,
  deleteDraft,
  startEditExisting,
  autosaveEditExisting,
  saveEditExistingAsDraft,
  discardEditExisting,
  saveEditAsNewAsDraft,
  autosaveEditAsNew,
  discardEditAsNew,
  startEditAsNew,
  saveEditExistingForPreview,
} from "./api";

/*
 Configuration for different article editor modes.
 
 This centralizes UI strings and API mappings so the editor component 
 can stay generic. Instead of 'if (mode === "edit")' checks everywhere, 
 we just read the required functions and strings from this object.
 */
export const WORKFLOW_CONFIG = {
  create: {
    mode: "create",
    headerTitle: "Create your Article",
    headerSubtitle: "Create your own Article here",
    getBadge: (status) => (status === "draft" ? "Draft Article" : "New Article"),
    // Create mode starts with a clean slate, so no initial load function is needed.
    startFn: null,
    saveDraftFn: async (id, payload) => {
      // In create mode, if we don't have an ID yet, we use createDraft.
      // The hook will handle the logic of switching between createDraft and updateDraft.
      return null; 
    },
    discardFn: deleteDraft,
    discardTitle: "Discard changes?",
    discardMessage: "This will permanently delete the current article draft and all unsaved changes.",
    exitPath: "/home",
  },
  "edit-existing": {
    mode: "edit-existing",
    headerTitle: "Edit your Article",
    headerSubtitle: "Update your existing article here",
    getBadge: () => "Editing Article",
    startFn: startEditExisting,
    saveDraftFn: saveEditExistingAsDraft,
    autosaveFn: autosaveEditExisting,
    previewSaveFn: saveEditExistingForPreview,
    discardFn: discardEditExisting,
    discardTitle: "Discard changes?",
    discardMessage: "This will restore the article to how it was before you started editing.",
    exitPath: "/write/unpublished",
  },
  "edit-as-new": {
    mode: "edit-as-new",
    headerTitle: "Edit as a New Article",
    headerSubtitle: "Create a brand new article using the same title",
    getBadge: () => "New Article Copy",
    startFn: startEditAsNew,
    saveDraftFn: saveEditAsNewAsDraft,
    autosaveFn: autosaveEditAsNew,
    discardFn: discardEditAsNew,
    discardTitle: "Discard changes?",
    discardMessage: "This will permanently delete the new article copy created for edit-as-new.",
    isTitleReadOnly: true,
    titleHelperText: "This title is copied from the original article and cannot be changed.",
    exitPath: "/write/unpublished",
  },
};

export const getWorkflowConfig = (mode) => {
  return WORKFLOW_CONFIG[mode] || WORKFLOW_CONFIG.create;
};
