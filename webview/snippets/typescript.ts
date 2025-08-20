export const typescriptSnippet = `
<span data-token="keyword">import</span> <span data-token="punctuation">{</span> <span data-token="variable">readFileSync</span> <span data-token="punctuation">}</span> <span data-token="keyword">from</span> <span data-token="string">'fs'</span><span data-token="punctuation">;</span>

<span data-token="keyword">const</span> <span data-token="constant">tsconfigContent</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">readFileSync</span><span data-token="punctuation">(</span><span data-token="string">"./tsconfig.json"</span><span data-token="punctuation">,</span> <span data-token="string">"utf-8"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="string">"--- tsconfig.json content ---<span data-token="constant">\\n</span><span data-token="string">"</span></span><span data-token="punctuation">,</span> <span data-token="constant">tsconfigContent</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">// A namespace to organize related code</span>
<span data-token="keyword">namespace</span> <span data-token="namespace">MyApp</span> <span data-token="punctuation">{</span>
  <span data-token="comment">// A proper TypeScript enum</span>
  <span data-token="keyword">export</span> <span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
    <span data-token="enumMember">Pending</span><span data-token="punctuation">,</span>
    <span data-token="enumMember">Completed</span><span data-token="punctuation">,</span>
  <span data-token="punctuation">}</span>

  <span data-token="comment">// An interface defines a contract</span>
  <span data-token="keyword">export</span> <span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="property">id</span><span data-token="operator">:</span> <span data-token="type">number</span><span data-token="punctuation">;</span>
    <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="functionAndMethod">onUpdate</span><span data-token="operator">:</span> <span data-token="type">UpdateHandler</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">)</span><span data-token="operator">:</span> <span data-token="interface">Promise</span><span data-token="punctuation">&lt;</span><span data-token="type">void</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>

  <span data-token="comment">// A type alias for a function signature (delegate)</span>
  <span data-token="keyword">export</span> <span data-token="keyword">type</span> <span data-token="type">UpdateHandler</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="operator">=</span> <span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="operator">:</span> <span data-token="typeParameter">T</span><span data-token="punctuation">)</span> <span data-token="operator">=&gt;</span> <span data-token="type">void</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A decorator for logging</span>
<span data-token="keyword">function</span> <span data-token="functionAndMethod">loggable</span><span data-token="punctuation">(</span><span data-token="parameter">constructor</span><span data-token="operator">:</span> <span data-token="interface">Function</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
  <span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="string">\`&#36;{</span><span data-token="parameter">constructor</span><span data-token="operator">.</span><span data-token="propertyReadOnly">name</span><span data-token="string">}</span><span data-token="string"> class was created.\`</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="decorator">@</span><span data-token="functionAndMethod">loggable</span>
<span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="keyword">implements</span> <span data-token="namespace">MyApp</span><span data-token="operator">.</span><span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="type">string</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
  <span data-token="property">#privateField</span><span data-token="operator">:</span> <span data-token="type">string</span> <span data-token="operator">=</span> <span data-token="string">"secret"</span><span data-token="punctuation">;</span>
  <span data-token="keyword">readonly</span> <span data-token="propertyReadOnly">VERSION</span><span data-token="punctuation">:</span> <span data-token="type">number</span> <span data-token="operator">=</span> <span data-token="number">1.0</span><span data-token="punctuation">;</span>

  <span data-token="keyword">get</span> <span data-token="property">id</span><span data-token="punctuation">()</span><span data-token="operator">:</span> <span data-token="type">number</span> <span data-token="punctuation">{</span> <span data-token="keyword">return</span> <span data-token="number">42</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>
  <span data-token="functionAndMethod">getSecret</span><span data-token="punctuation">()</span><span data-token="operator">:</span> <span data-token="type">string</span> <span data-token="punctuation">{</span> <span data-token="keyword">return</span> <span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="property">#privateField</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>

  <span data-token="keyword">async</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="functionAndMethod">onUpdate</span><span data-token="operaotr">:</span> <span data-token="namespace">MyApp</span><span data-token="operator">.</span><span data-token="type">UpdateHandler</span><span data-token="punctuation">&lt;</span><span data-token="type">string</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">)</span><span data-token="operator">:</span> <span data-token="interface">Promise</span><span data-token="punctuation">&lt;</span><span data-token="type">void</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">const</span> <span data-token="constant">data</span><span data-token="operator">:</span> <span data-token="type">string</span> <span data-token="operator">=</span> <span data-token="keyword">await</span> <span data-token="class">Promise</span><span data-token="operator">.</span><span data-token="functionAndMethod">resolve</span><span data-token="punctuation">(</span><span data-token="string">"some data"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="functionAndMethod">onUpdate</span><span data-token="punctuation">(</span><span data-token="constant">data</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">const</span> <span data-token="constant">service</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="class">DataService</span><span data-token="punctuation">()</span><span data-token="punctuation">;</span>
<span data-token="keyword">let</span> <span data-token="variable">isProcessing</span><span data-token="operator">:</span> <span data-token="type">boolean</span> <span data-token="operator">=</span> <span data-token="constant">true</span><span data-token="punctuation">;</span>

<span data-token="constant">service</span><span data-token="operator">.</span><span data-token="functionAndMethod">process</span><span data-token="punctuation">((</span><span data-token="parameter">data</span><span data-token="operator">:</span> <span data-token="type">string</span><span data-token="punctuation">)</span> <span data-token="operator">=&gt;</span> <span data-token="punctuation">{</span>
  <span data-token="keyword">const</span> <span data-token="constant">message</span> <span data-token="operator">=</span> <span data-token="string">\`
    Status: &#36;{<span data-token="namespace">MyApp</span><span data-token="operator">.</span><span data-token="enum">Status</span><span data-token="string">[</span><span data-token="namespace">MyApp</span><span data-token="operator">.</span><span data-token="enum">Status</span><span data-token="operator">.</span><span data-token="enumMember">Completed</span><span data-token="string">]}</span><span data-token="string">}</span><span data-token="string">
    Secret: &#36;{<span data-token="constant">service</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">getSecret</span><span data-token="punctuation">()</span><span data-token="string">}</span><span data-token="string">
  \`</span><span data-token="punctuation">;</span>

  <span data-token="keyword">if</span> <span data-token="punctuation">(</span><span data-token="variable">isProcessing</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="parameter">data</span> <span data-token="operator">=</span> <span data-token="constant">message</span><span data-token="punctuation">;</span>
    <span data-token="variable">console</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="punctuation">}</span>

  <span data-token="variable">console</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="constant">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">})</span><span data-token="punctuation">;</span>
`;
