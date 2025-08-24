export const cssSnippet = `
<span data-token="comment">/* CSS directive */</span>
<span data-token="directive">@charset</span> <span data-token="string">"UTF-8"</span><span data-token="punctuation">;</span>
<span data-token="directive">@import</span> <span data-token="functionAndMethod">url</span><span data-token="punctuation">(</span><span data-token="string">'https://fonts.googleapis.com/css?family=Open+Sans'</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">/* This snippet demonstrates various CSS features to test theme highlighting.
  Tokens like 'delegate', 'event', 'module', etc., have no CSS equivalent.
*/</span>
<span data-token="directive">@namespace</span> <span data-token="namespace">svg</span> <span data-token="functionAndMethod">url</span><span data-token="punctuation">(</span><span data-token="parameter"><u>http://www.w3.org/2000/svg</u></span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">-- CSS Custom Properties (Variables) --</span>
<span data-token="fieldAndAttribute">:root</span> <span data-token="punctuation">{</span>
  <span data-token="variable">--main-bg-color</span><span data-token="punctuation">:</span> <span data-token="constant">#</span><span data-token="text">0d1117</span><span data-token="punctuation">;</span>
  <span data-token="variable">--main-text-color</span><span data-token="punctuation">:</span> <span data-token="functionAndMethod">rgb</span><span data-token="punctuation">(</span><span data-token="number">220</span><span data-token="punctuation">,</span> <span data-token="number">200</span><span data-token="punctuation">,</span> <span data-token="number">180</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">/* Universal selector with a property */</span>
<span data-token="keyword">*</span> <span data-token="punctuation">{</span>
  <span data-token="property">box-sizing</span><span data-token="punctuation">:</span> <span data-token="constant">border-box</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">/* ID selector (represents a unique 'struct') and attribute selector */</span>
<span data-token="struct">#main-container</span><span data-token="punctuation">[</span><span data-token="fieldAndAttribute">data-layout</span><span data-token="operator">=</span><span data-token="string">"grid"</span><span data-token="punctuation">]</span> <span data-token="punctuation">{</span>
  <span data-token="property">display</span><span data-token="punctuation">:</span> <span data-token="constant">grid</span><span data-token="punctuation">;</span>
  <span data-token="property">gap</span><span data-token="punctuation">:</span> <span data-token="number">1</span><span data-token="operator">rem</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">/* Class selector with pseudo-class and pseudo-element */</span>
<span data-token="class">.button</span><span data-token="fieldAndAttribute">:hover</span> <span data-token="punctuation">{</span>
  <span data-token="property">color</span><span data-token="punctuation">:</span> <span data-token="functionAndMethod">var</span><span data-token="punctuation">(</span><span data-token="variable">--main-bg-color</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="property">border-color</span><span data-token="punctuation">:</span> <span data-token="constant">transparent</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="class">.button</span><span data-token="fieldAndAttribute">::before</span> <span data-token="punctuation">{</span>
  <span data-token="property">content</span><span data-token="punctuation">:</span> <span data-token="string">'▶ '</span><span data-token="punctuation">;</span>
  <span data-token="property">margin-right</span><span data-token="punctuation">:</span> <span data-token="functionAndMethod">calc</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="operator">px</span> <span data-token="operator">-</span> <span data-token="number">4</span><span data-token="operator">px</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">/* Keyframes Animation */</span>
<span data-token="directive">@keyframes</span> <span data-token="parameter">fade-in</span> <span data-token="punctuation">{</span>
  <span data-token="keyword">from</span> <span data-token="punctuation">{</span> <span data-token="property">opacity</span><span data-token="punctuation">:</span> <span data-token="number">0</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>
  <span data-token="keyword">to</span> <span data-token="punctuation">{</span> <span data-token="property">opacity</span><span data-token="punctuation">:</span> <span data-token="number">1</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">/* Media Query for responsive design */</span>
<span data-token="directive">@media</span> <span data-token="punctuation">(</span><span data-token="property">max-width</span><span data-token="punctuation">:</span> <span data-token="number">768</span><span data-token="operator">px</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
  <span data-token="type">body</span> <span data-token="punctuation">{</span>
    <span data-token="property">font-size</span><span data-token="punctuation">:</span> <span data-token="number">14</span><span data-token="operator">px</span> <span data-token="keyword">!important</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>
`;
