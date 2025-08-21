export const luaSnippet = `
<span data-token="comment">--[[
  This is a block comment.
  Lua doesn't have namespaces, but modules are created using tables.
--]]</span>
<span data-token="keyword">local</span> <span data-token="module">DataService</span> <span data-token="operator">=</span> <span data-token="punctuation">{}</span>

<span data-token="comment">--- A "delegate" or callback function type.</span>
<span data-token="comment">--- @alias UpdateHandler fun(message:string)</span>
<span data-token="keyword">local</span> <span data-token="delegate">UpdateHandler</span> <span data-token="operator">=</span> <span data-token="constant">nil</span>

<span data-token="comment">--- An "enum" is typically a table of constants.</span>
<span data-token="keyword">local</span> <span data-token="enum">Status</span> <span data-token="operator">=</span> <span data-token="punctuation">{</span>
  <span data-token="enumMember">Pending</span> <span data-token="operator">=</span> <span data-token="number">1</span><span data-token="punctuation">,</span>
  <span data-token="enumMember">Completed</span> <span data-token="operator">=</span> <span data-token="number">2</span>
<span data-token="punctuation">}</span>

<span data-token="comment">--- A "struct" or "class" is created with a metatable.</span>
<span data-token="keyword">local</span> <span data-token="struct">Point</span> <span data-token="operator">=</span> <span data-token="punctuation">{}</span>
<span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">__index</span> <span data-token="operator">=</span> <span data-token="struct">Point</span>

<span data-token="comment">--- Operator overloading is done via metamethods.</span>
<span data-token="keyword">function</span> <span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token="operatorOverload">__add</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="punctuation">,</span> <span data-token="parameter">b</span><span data-token="punctuation">)</span>
  <span data-token="keyword">return</span> <span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="punctuation">.</span><span data-token="property">x</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="punctuation">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="parameter">a</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="punctuation">.</span><span data-token="property">y</span><span data-token="punctuation">)</span>
<span data-token="keyword">end</span>

<span data-token="comment">--- A constructor function for our Point "class".</span>
<span data-token="keyword">function</span> <span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="parameter">x</span><span data-token="punctuation">,</span> <span data-token="parameter">y</span><span data-token="punctuation">)</span>
  <span data-token="keyword">local</span> <span data-token="variable">self</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">setmetatable</span><span data-token="punctuation">({},</span> <span data-token="struct">Point</span><span data-token="punctuation">)</span>
  <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="property">x</span> <span data-token="operator">=</span> <span data-token="parameter">x</span>
  <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="operator">=</span> <span data-token="parameter">y</span>
  <span data-token="keyword">return</span> <span data-token="variable">self</span>
<span data-token="keyword">end</span>

<span data-token="comment">--- Lua has no interfaces, but we can document the expected structure.</span>
<span data-token="comment">--- @interface IProcessable</span>
<span data-token="comment">--- @field process fun(self: IProcessable, data: any)</span>
<span data-token="keyword">local</span> <span data-token="interface">IProcessable</span> <span data-token="operator">=</span> <span data-token="constant">nil</span>

<span data-token="comment">-- A decorator is a higher-order function.</span>
<span data-token="keyword">local</span> <span data-token="keyword">function</span> <span data-token="decorator">withLogging</span><span data-token="punctuation">(</span><span data-token="parameter">func</span><span data-token="punctuation">)</span>
  <span data-token="keyword">return</span> <span data-token="keyword">function</span><span data-token="punctuation">(...)</span>
    <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="string">'Calling function...'</span><span data-token="punctuation">)</span>
    <span data-token="keyword">return</span> <span data-token="parameter">func</span><span data-token="punctuation">(...)</span>
  <span data-token="keyword">end</span>
<span data-token="keyword">end</span>

<span data-token="keyword">function</span> <span data-token="module">DataService</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">processData</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">)</span>
  <span data-token="keyword">local</span> <span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20.5</span><span data-token="punctuation">)</span>
  <span data-token="keyword">local</span> <span data-token="variable">p2</span> <span data-token="operator">=</span> <span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">)</span>
  <span data-token="keyword">local</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">p1</span> <span data-token="operator">+</span> <span data-token="variable">p2</span> <span data-token="comment">-- Using overloaded operator</span>

  <span data-token="comment">-- A verbatim, multi-line string</span>
  <span data-token="keyword">local</span> <span data-token="variable">message</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">[[
    Processing completed for: %s
    Result: (%d, %d)
  ]]</span>

  <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="namespace">string</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">format</span><span data-token="punctuation">(</span><span data-token="variable">message</span><span data-token="punctuation">,</span> <span data-token="parameter">data</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">y</span><span data-token="punctuation">))</span>
<span data-token="keyword">end</span>

<span data-token="text">This is some plain text outside of any code block.</span>
<span data-token="module">DataService</span><span data-token="punctuation">.</span><span data-token="event">onUpdate</span> <span data-token="operator">=</span> <span data-token="decorator">withLogging</span><span data-token="punctuation">(</span><span data-token="module">DataService</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">processData</span><span data-token="punctuation">)</span>
<span data-token="module">DataService</span><span data-token="punctuation">.</span><span data-token="event">onUpdate</span><span data-token="punctuation">(</span><span data-token="string">"Initial Data"</span><span data-token="punctuation">)</span>

<span data-token="keyword">return</span> <span data-token="module">DataService</span>
`;
