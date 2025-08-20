export const javascriptSnippet = `
<span data-token="comment">/**
 * This is a JSDoc block comment.
 * <span data-token="keyword">@template</span> <span data-token="variable">T</span>
 * <span data-token="keyword">@param</span> <span data-token="punctuation">{</span><span data-token="annotation">T</span><span data-token="punctuation">}</span> <span data-token="variable">data</span> <span data-token="comment">- Generic data parameter.</span>
 */</span>
<span data-token="keyword">import</span> <span data-token="punctuation">{</span> <span data-token="variable">readFileSync</span> <span data-token="punctuation">}</span> <span data-token="keyword">from</span> <span data-token="string">'fs'</span><span data-token="punctuation">;</span>

<span data-token="comment">// An "enum" is often a constant frozen object in JS.</span>
<span data-token="keyword">const</span> <span data-token="constant">Status</span> <span data-token="operator">=</span> <span data-token="class">Object</span><span data-token="operator">.</span><span data-token="functionAndMethod">freeze</span><span data-token="punctuation">({</span>
  <span data-token="property">PENDING</span><span data-token="punctuation">:</span> <span data-token="string">"pending"</span><span data-token="punctuation">,</span>
  <span data-token="property">COMPLETED</span><span data-token="punctuation">:</span> <span data-token="string">"completed"</span><span data-token="punctuation">,</span>
<span data-token="punctuation">})</span><span data-token="punctuation">;</span>

<span data-token="comment">// A decorator function (conceptual).</span>
<span data-token="keyword">function</span> <span data-token="functionAndMethod">loggable</span><span data-token="punctuation">(</span><span data-token="parameter">target</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
  <span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="string">\`</span><span data-token="string">&#36;{</span><span data-token="parameter">target</span><span data-token="operator">.</span><span data-token="property">name</span><span data-token="string">}</span><span data-token="string"> class was created.\`</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="decorator">@</span><span data-token="functionAndMethod">loggable</span>
<span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="punctuation">{</span>
  <span data-token="comment">/**</span> <span data-token="keyword">@type</span> <span data-token="punctuation">{</span><span data-token="annotation">string</span><span data-token="punctuation">}</span> <span data-token="comment">*/</span>
  <span data-token="property">#privateField</span> <span data-token="operator">=</span> <span data-token="string">"secret"</span><span data-token="punctuation">;</span>
  <span data-token="property">VERSION</span> <span data-token="operator">=</span> <span data-token="number">1.0</span><span data-token="punctuation">;</span>

  <span data-token="comment">// A read-only property using a getter.</span>
  <span data-token="keyword">get</span> <span data-token="property">id</span><span data-token="punctuation">()</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">return</span> <span data-token="number">42</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>

  <span data-token="comment">// New method to read the private field.</span>
  <span data-token="functionAndMethod">getSecret</span><span data-token="punctuation">()</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">return</span> <span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="property">#privateField</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>

  <span data-token="comment">/** A "delegate" or "event" is a callback function. */</span>
  <span data-token="keyword">async</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="parameter">onUpdate</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="comment">// Use readFileSync to simulate loading a config.</span>
    <span data-token="keyword">try</span> <span data-token="punctuation">{</span>
      <span data-token="keyword">const</span> <span data-token="constant">config</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">readFileSync</span><span data-token="punctuation">(</span><span data-token="string">"./config.json"</span><span data-token="punctuation">,</span> <span data-token="string">"utf8"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
      <span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="constant">config</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span> <span data-token="keyword">catch</span> <span data-token="punctuation">(</span><span data-token="variable">err</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
      <span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">error</span><span data-token="punctuation">(</span><span data-token="string">"Could not read config file."</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

    <span data-token="keyword">const</span> <span data-token="constant">data</span> <span data-token="operator">=</span> <span data-token="keyword">await</span> <span data-token="class">Promise</span><span data-token="operator">.</span><span data-token="functionAndMethod">resolve</span><span data-token="punctuation">(</span><span data-token="string">"some data"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="functionAndMethod">onUpdate</span><span data-token="punctuation">(</span><span data-token="constant">data</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">const</span> <span data-token="constant">service</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="class">DataService</span><span data-token="punctuation">()</span><span data-token="punctuation">;</span>
<span data-token="keyword">let</span> <span data-token="variable">isProcessing</span> <span data-token="operator">=</span> <span data-token="constant">true</span><span data-token="punctuation">;</span>

<span data-token="comment">// Using an arrow function as the callback</span>
<span data-token="constant">service</span><span data-token="operator">.</span><span data-token="functionAndMethod">process</span><span data-token="punctuation">((</span><span data-token="parameter">data</span><span data-token="punctuation">)</span> <span data-token="operator">=&gt;</span> <span data-token="punctuation">{</span>
  <span data-token="comment">// Use isProcessing in a conditional log.</span>
  <span data-token="keyword">if</span> <span data-token="punctuation">(</span><span data-token="variable">isProcessing</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="string">"...still processing..."</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>

  <span data-token="comment">// A multi-line string with interpolation.</span>
  <span data-token="keyword">const</span> <span data-token="constant">message</span> <span data-token="operator">=</span> <span data-token="string">\`
    Status: </span><span data-token="string">&#36;{</span><span data-token="constant">Status</span><span data-token="operator">.</span><span data-token="property">COMPLETED</span><span data-token="string">}</span><span data-token="string">
    Received: </span><span data-token="string">&#36;{</span><span data-token="parameter">data</span><span data-token="string">}</span><span data-token="string">
    Secret: </span><span data-token="string">&#36;{</span><span data-token="constant">service</span><span data-token="operator">.</span><span data-token="functionAndMethod">getSecret</span><span data-token="punctuation">()</span><span data-token="string">}</span><span data-token="string">
  \`</span><span data-token="punctuation">;</span>
  <span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="variable">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">})</span><span data-token="punctuation">;</span>
`;
