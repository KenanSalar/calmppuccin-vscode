export const cSnippet = `
<span data-token="comment">// The syntax in c is hard to customizy/colorize in vscode</span>
<span data-token="comment">// So the syntax will be less distinguishable</span>
<span data-token="comment">// I recommend changing the type color if you are a c dev</span>
<span data-token="annotation">#</span><span data-token="keyword">include</span> <span data-token="string">&lt;stdio.h&gt;</span>
<span data-token="annotation">#</span><span data-token="keyword">include</span> <span data-token="string">&lt;stdlib.h&gt;</span>

<span data-token="comment">// A preprocessor directive, can be seen as a form of "annotation"</span>
<span data-token="annotation">#</span><span data-token="keyword">pragma</span> <span data-token="annotation">once</span>

<span data-token="comment">// Enum for status codes</span>
<span data-token="keyword">typedef</span> <span data-token="keyword">enum</span> <span data-token="punctuation">{</span>
    <span data-token="enumMember">PENDING</span><span data-token="punctuation">,</span>
    <span data-token="enumMember">COMPLETED</span>
<span data-token="punctuation">}</span> <span data-token="type">Status</span><span data-token="punctuation">;</span>

<span data-token="comment">// Using a function pointer to simulate a delegate</span>
<span data-token="keyword">typedef</span> <span data-token="keyword">void</span> <span data-token="punctuation">(</span><span data-token="operator">*</span><span data-token="type">UpdateHandler</span><span data-token="punctuation">)</span><span data-token="punctuation">(</span><span data-token="keyword">const</span> <span data-token="type">char</span> <span data-token="operator">*</span><span data-token="parameter">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">// Struct for a Point (replaces C#'s record struct)</span>
<span data-token="keyword">typedef</span> <span data-token="keyword">struct</span> <span data-token="punctuation">{</span>
    <span data-token="type">int</span> <span data-token="property">x</span><span data-token="punctuation">;</span>
    <span data-token="type">int</span> <span data-token="property">y</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span> <span data-token="type">Point</span><span data-token="punctuation">;</span>

<span data-token="comment">// A struct to hold "interface" functions (vtable)</span>
<span data-token="keyword">typedef</span> <span data-token="keyword">struct</span> <span data-token="punctuation">{</span>
    <span data-token="type">void</span> <span data-token="punctuation">(</span><span data-token="operator">*</span><span data-token="property">process</span><span data-token="punctuation">)</span><span data-token="punctuation">(</span><span data-token="type">void</span> <span data-token="operator">*</span><span data-token="parameter">self</span><span data-token="punctuation">,</span> <span data-token="type">int</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span> <span data-token="type">IProcessable</span><span data-token="punctuation">;</span>

<span data-token="comment">// A struct representing a data service</span>
<span data-token="keyword">typedef</span> <span data-token="keyword">struct</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">const</span> <span data-token="type">char</span> <span data-token="operator">*</span><span data-token="property">name</span><span data-token="punctuation">;</span>
    <span data-token="type">UpdateHandler</span> <span data-token="property">on_update</span><span data-token="punctuation">;</span> <span data-token="comment">// Simulating an event</span>
<span data-token="punctuation">}</span> <span data-token="type">DataService</span><span data-token="punctuation">;</span>

<span data-token="comment">// A regular function to add two points (no operator overloading)</span>
<span data-token="type">Point</span> <span data-token="functionAndMethod">add_points</span><span data-token="punctuation">(</span><span data-token="type">Point</span> <span data-token="parameter">a</span><span data-token="punctuation">,</span> <span data-token="type">Point</span> <span data-token="parameter">b</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="type">Point</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="punctuation">{</span> <span data-token="parameter">a</span><span data-token="punctuation">.</span><span data-token="property">x</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="punctuation">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="parameter">a</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="keyword">return</span> <span data-token="variable">result</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Main entry point</span>
<span data-token="type">int</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="type">void</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">const</span> <span data-token="type">double</span> <span data-token="variable">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14</span><span data-token="punctuation">;</span>
    <span data-token="type">Point</span> <span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token="punctuation">{</span> <span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span> <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="type">Point</span><span data-token="operator">*</span> <span data-token="variable">p2_ptr</span> <span data-token="operator">=</span> <span data-token="punctuation">(</span><span data-token="type">Point</span> <span data-token="operator">*</span><span data-token="punctuation">)</span><span data-token="functionAndMethod">malloc</span><span data-token="punctuation">(</span><span data-token="operator">sizeof</span><span data-token="punctuation">(</span><span data-token="type">Point</span><span data-token="punctuation">)</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="variable">p2_ptr</span><span data-token="operator">-></span><span data-token="property">x</span> <span data-token="operator">=</span> <span data-token="number">5</span><span data-token="punctuation">;</span>
    <span data-token="variable">p2_ptr</span><span data-token="operator">-></span><span data-token="property">y</span> <span data-token="operator">=</span> <span data-token="number">8</span><span data-token="punctuation">;</span>

    <span data-token="type">Point</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">add_points</span><span data-token="punctuation">(</span><span data-token="variable">p1</span><span data-token="punctuation">,</span> <span data-token="operator">*</span><span data-token="variable">p2_ptr</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

    <span data-token="comment">// String literal with format specifiers</span>
    <span data-token="functionAndMethod">printf</span><span data-token="punctuation">(</span><span data-token="string">"Result: X=</span><span data-token="constant">%d</span><span data-token="string">, Y=</span><span data-token="constant">%d</span><span data-token="constant">\\n</span><span data-token="string">"</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">y</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="functionAndMethod">free</span><span data-token="punctuation">(</span><span data-token="variable">p2_ptr</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

    <span data-token="keyword">return</span> <span data-token="number">0</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>
`;