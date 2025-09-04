export const uiSnippet = `
<style>
  /* Overall container for the entire preview layout */
  .ui-layout-wrapper {
    display: flex;
    flex-direction: column; /* Stack Title Bar on top of the rest */
    height: 100%;
    width: 100%;
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--base-color, #11111a); /* Fallback BG */
  }

  /* Red Area: Title Bar at the top */
  .ui-layout-titlebar {
    flex-shrink: 0;
    height: 30px; /* Represents the title bar area */
    background-color: var(--base-color, #11111a);
    transition: background-color 250ms ease;
  }

  /* Container for everything below the title bar */
  .ui-layout-main-area {
    display: flex;
    flex-grow: 1; /* Take up remaining vertical space */
    height: 100%;
  }

  /* Red Area: Activity Bar on the far left */
  .ui-layout-activitybar {
    flex-shrink: 0;
    width: 48px; /* Standard VS Code activity bar width */
    background-color: var(--base-color, #11111a);
    transition: background-color 250ms ease;
  }

  /* Blue Area: Sidebar next to the activity bar */
  .ui-layout-sidebar {
    flex-shrink: 0;
    width: 150px; /* Visual representation of the sidebar */
    background-color: var(--mantle-color, #171724);
    transition: background-color 250ms ease;
  }

  /* Wrapper for the tab bar and editor pane */
  .ui-layout-editor-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  /* Blue Area: Tab bar above the editor */
  .ui-layout-tabbar {
    flex-shrink: 0;
    height: 35px; /* Standard VS Code tab bar height */
    background-color: var(--mantle-color, #171724);
    transition: background-color 250ms ease;
  }

  /* Green Area: Main editor content area */
  .ui-layout-editor {
    flex-grow: 1;
    background-color: var(--crust-color, #1d1d2c);
    transition: background-color 250ms ease;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--vscode-editor-foreground);
    text-align: center;
    padding: 20px;
  }

  .ui-layout-editor span {
    display: block;
    font-size: 0.85em;
    opacity: 0.7;
    margin-top: 4px;
  }
</style>

<div class="ui-layout-wrapper">
  <div class="ui-layout-titlebar" data-token="base"></div>
  
  <div class="ui-layout-main-area">
    <div class="ui-layout-activitybar" data-token="base"></div>
    
    <div class="ui-layout-sidebar" data-token="mantle"></div>
    
    <div class="ui-layout-editor-wrapper">
      <div class="ui-layout-tabbar" data-token="mantle"></div>
      
      <div class="ui-layout-editor" data-token="crust">
      </div>
    </div>
  </div>
</div>
`;
