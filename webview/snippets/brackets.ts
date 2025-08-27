export const bracketsSnippet = `
<span data-token="comment">&lt;!-- Curly Brackets --&gt;</span>
<span data-token="text">level 1 </span><span data-token="uiBracket1">{</span>
  <span data-token="text">  level 2 </span><span data-token="uiBracket2">{</span>
    <span data-token="text">    level 3 </span><span data-token="uiBracket3">{</span>
      <span data-token="text">      level 4 </span><span data-token="uiBracket4">{</span>
        <span data-token="text">        level 5 </span><span data-token="uiBracket5">{</span>
          <span data-token="text">          level 6 </span><span data-token="uiBracket6">{</span><span data-token="text"> ... </span><span data-token="uiBracket6">}</span>
        <span data-token="uiBracket5">}</span>
      <span data-token="uiBracket4">}</span>
    <span data-token="uiBracket3">}</span>
  <span data-token="uiBracket2">}</span>
<span data-token="uiBracket1">}</span>

<span data-token="comment">&lt;!-- Round Brackets --&gt;</span>
<span data-token="text">level 1 </span><span data-token="uiBracket1">(</span>
  <span data-token="text">  level 2 </span><span data-token="uiBracket2">(</span>
    <span data-token="text">    level 3 </span><span data-token="uiBracket3">(</span>
      <span data-token="text">      level 4 </span><span data-token="uiBracket4">(</span>
        <span data-token="text">        level 5 </span><span data-token="uiBracket5">(</span>
          <span data-token="text">          level 6 </span><span data-token="uiBracket6">(</span><span data-token="text"> ... </span><span data-token="uiBracket6">)</span>
        <span data-token="uiBracket5">)</span>
      <span data-token="uiBracket4">)</span>
    <span data-token="uiBracket3">)</span>
  <span data-token="uiBracket2">)</span>
<span data-token="uiBracket1">)</span>

<span data-token="comment">&lt;!-- Square Brackets --&gt;</span>
<span data-token="text">level 1 </span><span data-token="uiBracket1">[</span>
  <span data-token="text">  level 2 </span><span data-token="uiBracket2">[</span>
    <span data-token="text">    level 3 </span><span data-token="uiBracket3">[</span>
      <span data-token="text">      level 4 </span><span data-token="uiBracket4">[</span>
        <span data-token="text">        level 5 </span><span data-token="uiBracket5">[</span>
          <span data-token="text">          level 6 </span><span data-token="uiBracket6">[</span><span data-token="text"> ... </span><span data-token="uiBracket6">]</span>
        <span data-token="uiBracket5">]</span>
      <span data-token="uiBracket4">]</span>
    <span data-token="uiBracket3">]</span>
  <span data-token="uiBracket2">]</span>
<span data-token="uiBracket1">]</span>
`;
