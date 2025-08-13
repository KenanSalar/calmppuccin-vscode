export const rSnippet = `
<span data-token="comment"># Load a "module" or "namespace" (package)</span>
<span data-token="functionAndMethod">library</span><span data-token="punctuation">(</span><span data-token="module">stats</span><span data-token="punctuation">)</span>

<span data-token="comment">#' An "enum" can be represented by a factor.</span>
<span data-token="enum">Status</span> <span data-token="operator">&lt;-</span> <span data-token="functionAndMethod">factor</span><span data-token="punctuation">(</span><span data-token="functionAndMethod">c</span><span data-token="punctuation">(</span><span data-token="string">"Pending"</span><span data-token="punctuation">,</span> <span data-token="string">"Completed"</span><span data-token="punctuation">))</span>
<span data-token="variable">current_status</span> <span data-token="operator">&lt;-</span> <span data-token="enum">Status</span><span data-token="punctuation">[</span><span data-token="number">1</span><span data-token="punctuation">]</span> <span data-token="comment"># Accessing an "enumMember"</span>

<span data-token="comment">#' A "struct" or "class" using the S3 object system.</span>
<span data-token="comment">#' @param x numeric</span>
<span data-token="comment">#' @param y numeric</span>
<span data-token="keyword">function</span> <span data-token="struct">new_Point</span><span data-token="punctuation">(</span><span data-token="parameter">x</span><span data-token="punctuation">,</span> <span data-token="parameter">y</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
  <span data-token="variable">point</span> <span data-token="operator">&lt;-</span> <span data-token="functionAndMethod">list</span><span data-token="punctuation">(</span><span data-token="property">x</span> <span data-token="operator">=</span> <span data-token="parameter">x</span><span data-token="punctuation">,</span> <span data-token="property">y</span> <span data-token="operator">=</span> <span data-token="parameter">y</span><span data-token="punctuation">)</span>
  <span data-token="functionAndMethod">class</span><span data-token="punctuation">(</span><span data-token="variable">point</span><span data-token="punctuation">)</span> <span data-token="operator">&lt;-</span> <span data-token="string">"Point"</span>
  <span data-token="keyword">return</span><span data-token="punctuation">(</span><span data-token="variable">point</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">#' "Operator Overloading" for the '+' operator on our Point class.</span>
<span data-token="keyword">function</span> <span data-token="operatorOverload">+.Point</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="punctuation">,</span> <span data-token="parameter">b</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
  <span data-token="functionAndMethod">new_Point</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="operator">$</span><span data-token="fieldAndAttribute">x</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="operator">$</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="parameter">a</span><span data-token="operator">$</span><span data-token="fieldAndAttribute">y</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token-="operator">$</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">#' A "delegate" can be thought of as passing a function as an argument.</span>
<span data-token="comment">#' @param handler function - The callback to execute.</span>
<span data-token="keyword">function</span> <span data-token="event">register_event</span><span data-token="punctuation">(</span><span data-token="parameter">handler</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
  <span data-token="parameter">handler</span><span data-token="punctuation">(</span><span data-token="string">"Event triggered on registration"</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment"># A constant value (by convention).</span>
<span data-token="constant">PI</span> <span data-token="operator">&lt;-</span> <span data-token="number">3.14159</span>

<span data-token="keyword">function</span> <span data-token="functionAndMethod">run_analysis</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
  <span data-token="variable">p1</span> <span data-token="operator">&lt;-</span> <span data-token="struct">new_Point</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">)</span>
  <span data-token="variable">p2</span> <span data-token="operator">&lt;-</span> <span data-token="struct">new_Point</span><span data-token="punctuation">(</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">)</span>
  
  <span data-token="variable">result</span> <span data-token="operator">&lt;-</span> <span data-token="variable">p1</span> <span data-token="operator">+</span> <span data-token="variable">p2</span>
  
  <span data-token="comment"># Using paste0 for string concatenation</span>
  <span data-token="variable">message</span> <span data-token="operator">&lt;-</span> <span data-token="functionAndMethod">paste0</span><span data-token="punctuation">(</span>
    <span data-token="string">"Result: ("</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="operator">$</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="string">", "</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="operator">$</span><span data-token="property">y</span><span data-token="punctuation">,</span> <span data-token="string">")"</span><span data-token="punctuation">,</span> <span data-token="string">"\\n"</span>
  <span data-token="punctuation">)</span>
  
  <span data-token="functionAndMethod">cat</span><span data-token="punctuation">(</span><span data-token="variable">message</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="text">This is some plain text.</span>
<span data-token="functionAndMethod">run_analysis</span><span data-token="punctuation">()</span>
`;