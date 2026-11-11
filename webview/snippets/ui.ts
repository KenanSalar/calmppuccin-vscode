export const uiSnippet = `
<div class="ui-layout-wrapper">
  <div class="ui-layout-titlebar" data-token="base"></div>
  
  <div class="ui-layout-main-area">
    <div class="ui-layout-activitybar" data-token="base"></div>
    
    <div class="ui-layout-sidebar" data-token="mantle">
      <div class="ui-layout-file-text" data-token="uiText">file-one.ts</div>
      <div class="ui-layout-file-text" data-token="uiText">another-file.js</div>
      <div class="ui-layout-file-text" data-token="uiText">styles.css</div>
    </div>
    
    <div class="ui-layout-editor-wrapper">
      <div class="ui-layout-tabbar" data-token="mantle"></div>
      
      <div class="ui-layout-editor" data-token="crust">
      </div>
    </div>
  </div>
</div>
`;
