(function () {
  const vscode = acquireVsCodeApi();

  /** @type {import("../src/core/types").StoryBoardDocument | null} */
  let boardState = null;

  const storyTitle = document.getElementById("storyTitle");

  const asA = document.getElementById("asA");
  const iWantTo = document.getElementById("iWantTo");
  const soThat = document.getElementById("soThat");

  const acceptanceCriteria = document.getElementById("acceptanceCriteria");
  const businessRules = document.getElementById("businessRules");

  const addAcceptance = document.getElementById("addAcceptance");
  const addBusinessRule = document.getElementById("addBusinessRule");

  const status = document.getElementById("status");
  const priority = document.getElementById("priority");
  const storyPoints = document.getElementById("storyPoints");
  const devNotes = document.getElementById("devNotes");

  function getSelectedStory() {
    if (!boardState) {
      return null;
    }

    return (
      boardState.stories.find((story) => story.id === boardState.selectedStoryId) ||
      boardState.stories[0] ||
      null
    );
  }

  function save() {
    if (!boardState) {
      return;
    }

    vscode.postMessage({
      type: "saveDocument",
      payload: boardState,
    });
  }

  function updateSelectedStory(mutator) {
    const story = getSelectedStory();
    if (!story) {
      return;
    }

    mutator(story);
    render();
    save();
  }

  function renderCriteriaList(root, list, ordered) {
    if (!root) {
      return;
    }

    root.innerHTML = "";

    list.forEach((criterion, index) => {
      const li = document.createElement("li");
      li.className = "criterion-item";

      const textarea = document.createElement("textarea");
      textarea.value = criterion;
      textarea.rows = ordered ? 4 : 2;
      textarea.addEventListener("input", () => {
        updateSelectedStory((story) => {
          const target = ordered ? story.acceptanceCriteria : story.businessRules;
          target[index] = textarea.value;
        });
      });

      li.appendChild(textarea);
      root.appendChild(li);
    });
  }

  function render() {
    const selectedStory = getSelectedStory();

    if (!selectedStory) {
      return;
    }

    if (storyTitle) {
      storyTitle.textContent = selectedStory.title || "User Story";
    }

    if (asA) {
      asA.value = selectedStory.statement.asA;
    }

    if (iWantTo) {
      iWantTo.value = selectedStory.statement.iWantTo;
    }

    if (soThat) {
      soThat.value = selectedStory.statement.soThat;
    }

    renderCriteriaList(businessRules, selectedStory.businessRules, false);
    renderCriteriaList(acceptanceCriteria, selectedStory.acceptanceCriteria, true);

    if (status) {
      status.value = selectedStory.status;
    }

    if (priority) {
      priority.value = selectedStory.priority;
    }

    if (storyPoints) {
      storyPoints.value = String(selectedStory.storyPoints);
    }

    if (devNotes) {
      devNotes.value = selectedStory.devNotes;
    }
  }

  if (asA) {
    asA.addEventListener("input", () => {
      updateSelectedStory((story) => {
        story.statement.asA = asA.value;
      });
    });
  }

  if (iWantTo) {
    iWantTo.addEventListener("input", () => {
      updateSelectedStory((story) => {
        story.statement.iWantTo = iWantTo.value;
      });
    });
  }

  if (soThat) {
    soThat.addEventListener("input", () => {
      updateSelectedStory((story) => {
        story.statement.soThat = soThat.value;
      });
    });
  }

  if (addAcceptance) {
    addAcceptance.addEventListener("click", () => {
      updateSelectedStory((story) => {
        story.acceptanceCriteria.push("Given ...\nWhen ...\nThen ...");
      });
    });
  }

  if (addBusinessRule) {
    addBusinessRule.addEventListener("click", () => {
      updateSelectedStory((story) => {
        story.businessRules.push("New business rule");
      });
    });
  }

  if (status) {
    status.addEventListener("change", () => {
      updateSelectedStory((story) => {
        story.status = status.value;
      });
    });
  }

  if (priority) {
    priority.addEventListener("change", () => {
      updateSelectedStory((story) => {
        story.priority = priority.value;
      });
    });
  }

  if (storyPoints) {
    storyPoints.addEventListener("input", () => {
      updateSelectedStory((story) => {
        story.storyPoints = Number(storyPoints.value) || 0;
      });
    });
  }

  if (devNotes) {
    devNotes.addEventListener("input", () => {
      updateSelectedStory((story) => {
        story.devNotes = devNotes.value;
      });
    });
  }

  window.addEventListener("message", (event) => {
    const message = event.data;

    if (message?.type !== "setState") {
      return;
    }

    boardState = message.payload;
    render();
  });
})();
