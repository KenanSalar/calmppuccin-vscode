export const luaSnippet = `
<span data-token="comment">--[[
  This is a block comment.
  Lua doesn't have namespaces, but modules are created using tables.
  Which are displayed here as variable.
--]]</span>
<span data-token="keyword">local</span> <span data-token="variable">DataService</span> <span data-token="operator">=</span> <span data-token="punctuation">{}</span>

<span data-token="comment">--- A "delegate" or callback function type.</span>
<span data-token="comment">---</span> <span data-token="annotation">@alias</span> <span data-token="keyword">UpdateHandler</span> <span data-token="keyword">fun</span><span data-token="punctuation">(</span><span data-token="parameter">message</span><span data-token="operator">:</span><span data-token="type">string</span><span data-token="punctuation">)</span>
<span data-token="keyword">local</span> <span data-token="variable">UpdateHandler</span> <span data-token="operator">=</span> <span data-token="constant">nil</span>

<span data-token="comment">--- An "enum" is typically a table of constants.</span>
<span data-token="keyword">local</span> <span data-token="Variable">Status</span> <span data-token="operator">=</span> <span data-token="punctuation">{</span>
  <span data-token="property">Pending</span> <span data-token="operator">=</span> <span data-token="number">1</span><span data-token="punctuation">,</span>
  <span data-token="property">Completed</span> <span data-token="operator">=</span> <span data-token="number">2</span>
<span data-token="punctuation">}</span>

<span data-token="comment">--- A "struct" or "class" is created with a metatable.</span>
<span data-token="keyword">local</span> <span data-token="variable">Point</span> <span data-token="operator">=</span> <span data-token="punctuation">{}</span>
<span data-token="variable">Point</span><span data-token="punctuation">.</span><span data-token="property">__index</span> <span data-token="operator">=</span> <span data-token="variable">Point</span>

<span data-token="comment">--- Operator overloading is done via metamethods.</span>
<span data-token="keyword">function</span> <span data-token="variable">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">__add</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="punctuation">,</span> <span data-token="parameter">b</span><span data-token="punctuation">)</span>
  <span data-token="keyword">return</span> <span data-token="variable">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="punctuation">.</span><span data-token="property">x</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="punctuation">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="parameter">a</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="punctuation">.</span><span data-token="property">y</span><span data-token="punctuation">)</span>
<span data-token="keyword">end</span>

<span data-token="comment">--- A constructor function for our Point "class".</span>
<span data-token="keyword">function</span> <span data-token="variable">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="parameter">x</span><span data-token="punctuation">,</span> <span data-token="parameter">y</span><span data-token="punctuation">)</span>
  <span data-token="keyword">local</span> <span data-token="variable">self</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">setmetatable</span><span data-token="punctuation">({},</span> <span data-token="variable">Point</span><span data-token="punctuation">)</span>
  <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="property">x</span> <span data-token="operator">=</span> <span data-token="parameter">x</span>
  <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="operator">=</span> <span data-token="parameter">y</span>
  <span data-token="keyword">return</span> <span data-token="variable">self</span>
<span data-token="keyword">end</span>

<span data-token="comment">--- We can document an interface-like structure using a class annotation.</span>
<span data-token="comment">---</span> <span data-token="annotation">@class</span> <span data-token="class">IProcessable</span>
<span data-token="comment">---</span> <span data-token="annotation">@field</span> <span data-token="property">process</span> <span data-token="keyword">fun</span><span data-token="punctuation">(</span><span data-token="parameter">self</span><span data-token="operator">:</span> <span data-token="type">IProcessable</span><span data-token="operator">,</span> <span data-token="parameter">data</span><span data-token="operator">:</span> <span data-token="type">any</span><span data-token="punctuation">)</span>
<span data-token="keyword">local</span> <span data-token="class">IProcessable</span> <span data-token="operator">=</span> <span data-token="constant">nil</span>

<span data-token="comment">-- A decorator is a higher-order function.</span>
<span data-token="keyword">local</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">withLogging</span><span data-token="punctuation">(</span><span data-token="parameter">func</span><span data-token="punctuation">)</span>
  <span data-token="keyword">return</span> <span data-token="keyword">function</span><span data-token="punctuation">(...)</span>
    <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="string">'Calling function...'</span><span data-token="punctuation">)</span>
    <span data-token="keyword">return</span> <span data-token="parameter">func</span><span data-token="punctuation">(...)</span>
  <span data-token="keyword">end</span>
<span data-token="keyword">end</span>

<span data-token="keyword">function</span> <span data-token="variable">DataService</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">processData</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">)</span>
  <span data-token="keyword">local</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">withLogging</span><span data-token="punctuation">(</span><span data-token="variable">DataService</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">processData</span><span data-token="punctuation">)(</span><span data-token="parameter">data</span><span data-token="punctuation">)</span> <span data-token="comment">-- Using decorator</span>

  <span data-token="keyword">local</span> <span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token="variable">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20.5</span><span data-token="punctuation">)</span>
  <span data-token="keyword">local</span> <span data-token="variable">p2</span> <span data-token="operator">=</span> <span data-token="variable">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">)</span>
  <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">p1</span> <span data-token="operator">+</span> <span data-token="variable">p2</span> <span data-token="comment">-- Using overloaded operator</span>

  <span data-token="comment">-- Multi-line string</span>
  <span data-token="keyword">local</span> <span data-token="variable">message</span> <span data-token="operator">=</span> <span data-token="string">[[
    Processing completed for: %s
    Result: (%d, %d)
  ]]</span>

  <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="constant">string</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">format</span><span data-token="punctuation">(</span><span data-token="variable">message</span><span data-token="punctuation">,</span> <span data-token="parameter">data</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">y</span><span data-token="punctuation">))</span>

  <span data-token="keyword">if</span> <span data-token="variable">UpdateHandler</span> <span data-token="keyword">then</span>
    <span data-token="variable">UpdateHandler</span><span data-token="punctuation">(</span><span data-token="string">"Data processed successfully with status: "</span> <span data-token="operator">..</span> <span data-token="variable">Status</span><span data-token="punctuation">.</span><span data-token="property">Completed</span><span data-token="punctuation">)</span>
  <span data-token="keyword">end</span>
<span data-token="keyword">end</span>

<span data-token="variable">DataService</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">onUpdate</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">withLogging</span><span data-token="punctuation">(</span><span data-token="variable">DataService</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">processData</span><span data-token="punctuation">)</span>
<span data-token="variable">DataService</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">onUpdate</span><span data-token="punctuation">(</span><span data-token="string">"Initial Data"</span><span data-token="punctuation">)</span>

<span data-token="keyword">return</span> <span data-token="variable">DataService</span>
`;
