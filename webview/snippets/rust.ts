export const rustSnippet = `
<span data-token="keyword">use</span> <span data-token="namespace">std<span data-token="operator">::</span>ops<span data-token="operator">::</span>Add</span><span data-token="punctuation">;</span>

<span data-token="comment">// A module can be used as a namespace</span>
<span data-token="keyword">mod</span> <span data-token="module">core</span> <span data-token="punctuation">{</span>
    <span data-token="comment">// An enum with associated data</span>
    <span data-token="attributeBracket">#[</span><span data-token="decorator">derive</span><span data-token="punctuation">(</span><span data-token="class">Debug</span><span data-token="punctuation">)</span><span data-token="attributeBracket">]</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
        <span data-token="enumMember">Pending</span><span data-token="punctuation">,</span>
        <span data-token="enumMember">Completed</span><span data-token="punctuation">{</span> <span data-token="property">time</span><span data-token="punctuation">:</span> <span data-token="type">u64</span> <span data-token="punctuation">}</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A trait is Rust's equivalent of an interface</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">trait</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">fn</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="operator">&</span><span data-token="keyword">mut</span> <span data-token="variable">self</span><span data-token="punctuation">,</span> <span data-token="parameter">data</span><span data-token="punctuation">:</span> <span data-token="typeParameter">T</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A struct with a derive attribute (annotation)</span>
    <span data-token="attributeBracket">#[</span><span data-token="annotation">derive</span><span data-token="punctuation">(</span><span data-token="class">Debug</span><span data-token="punctuation">,</span> <span data-token="class">Clone</span><span data-token="punctuation">,</span> <span data-token="class">Copy</span><span data-token="punctuation">)</span><span data-token="attributeBracket">]</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">struct</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">pub</span> <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="type">i32</span><span data-token="punctuation">,</span>
        <span data-token="keyword">pub</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="type">i32</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// Operator overloading by implementing the 'Add' trait</span>
    <span data-token="keyword">impl</span> <span data-token="class">Add</span> <span data-token="keyword">for</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">type</span> <span data-token="type">Output</span> <span data-token="operator">=</span> <span data-token="keyword">Self</span><span data-token="punctuation">;</span>
        <span data-token="keyword">fn</span> <span data-token="operatorOverload">add</span><span data-token="punctuation">(</span><span data-token="variable">self</span><span data-token="punctuation">,</span> <span data-token="parameter">other</span><span data-token="punctuation">:</span> <span data-token="keyword">Self</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="keyword">Self</span> <span data-token="punctuation">{</span>
            <span data-token="keyword">Self</span> <span data-token="punctuation">{</span> <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span> <span data-token="punctuation">}</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A struct that acts like a class</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">struct</span> <span data-token="class">DataService</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
        <span data-token="property">name</span><span data-token="punctuation">:</span> <span data-token="type">String</span><span data-token="punctuation">,</span>
        <span data-token="comment">// A delegate/callback using a closure type</span>
        <span data-token="keyword">pub</span> <span data-token="event">on_update</span><span data-token="punctuation">:</span> <span data-token="class">Box</span><span data-token="punctuation">&lt;</span><span data-token="keyword">dyn</span> <span data-token="delegate">Fn</span><span data-token="punctuation">(</span><span data-token="typeParameter">T</span><span data-token="punctuation">)</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span>

    <span data-token="keyword">impl</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="class">DataService</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
        <span data-token="comment">// Getter for a private field (read-only property)</span>
        <span data-token="keyword">pub</span> <span data-token="keyword">fn</span> <span data-token="propertyReadOnly">name</span><span data-token="punctuation">(</span><span data-token="operator">&</span><span data-token="variable">self</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="operator">&</span><span data-token="type">str</span> <span data-token="punctuation">{</span>
            <span data-token="operator">&</span><span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="property">name</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">as_str</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">fn</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">let</span> <span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token="module">core</span><span data-token="operator">::</span><span data-token="struct">Point</span> <span data-token="punctuation">{</span> <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="number">20</span> <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="keyword">let</span> <span data-token="variable">p2</span> <span data-token="operator">=</span> <span data-token="module">core</span><span data-token="operator">::</span><span data-token="struct">Point</span> <span data-token="punctuation">{</span> <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="number">8</span> <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="keyword">let</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">p1</span> <span data-token="operator">+</span> <span data-token="variable">p2</span><span data-token="punctuation">;</span> <span data-token="comment">// Uses the overloaded '+' operator</span>

    <span data-token="comment">// A macro for printing, a core part of Rust</span>
    <span data-token="functionAndMethod">println!</span><span data-token="punctuation">(</span><span data-token="string">"Result: {:?}"</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

    <span data-token="comment">// A raw string (verbatim)</span>
    <span data-token="keyword">let</span> <span data-token="variable">path</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">r#"C:\\Users\\Rustacean\\Documents"#</span><span data-token="punctuation">;</span>
    <span data-token="functionAndMethod">println!</span><span data-token="punctuation">(</span><span data-token="string">"Path: {}"</span><span data-token="punctuation">,</span> <span data-token="variable">path</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="text">This is some plain text.</span>
<span data-token="punctuation">}</span>
`;
