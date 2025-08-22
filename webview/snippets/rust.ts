export const rustSnippet = `
<span data-token="comment">// A module can be used as a namespace</span>
<span data-token="keyword">mod</span> <span data-token="namespace">core</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">use</span> <span data-token="namespace">std<span data-token="operator">::</span><span data-token="namespace">ops</span><span data-token="operator">::</span><span data-token="interface">Add</span></span><span data-token="punctuation">;</span>

    <span data-token="comment">// An enum with associated data</span>
    <span data-token="fieldAndAttribute">#[</span><span data-token="decorator">derive</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">Debug</span><span data-token="punctuation">)</span><span data-token="fieldAndAttribute">]</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
        <span data-token="enumMember">Pending</span><span data-token="punctuation">,</span>
        <span data-token="enumMember">Completed</span> <span data-token="punctuation">{</span> <span data-token="property">time</span><span data-token="operator">:</span> <span data-token="type">u64</span> <span data-token="punctuation">}</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A trait is Rust's equivalent of an interface</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">trait</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">fn</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="operator">&</span><span data-token="keyword">mut</span> <span data-token="keyword">self</span><span data-token="punctuation">,</span> <span data-token="parameter">data</span><span data-token="punctuation">:</span> <span data-token="typeParameter">T</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A struct with a derive attribute (annotation)</span>
    <span data-token="fieldAndAttribute">#[</span><span data-token="decorator">derive</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">Debug</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">Clone</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">Copy</span><span data-token="punctuation">)</span><span data-token="fieldAndAttribute">]</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">struct</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">pub</span> <span data-token="property">x</span><span data-token="operator">:</span> <span data-token="type">i32</span><span data-token="punctuation">,</span>
        <span data-token="keyword">pub</span> <span data-token="property">y</span><span data-token="operator">:</span> <span data-token="type">i32</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// Operator overloading by implementing the 'Add' trait</span>
    <span data-token="keyword">impl</span> <span data-token="interface">Add</span> <span data-token="keyword">for</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">type</span> <span data-token="typeAlias">Output</span> <span data-token="operator">=</span> <span data-token="type">Self</span><span data-token="punctuation">;</span>
        <span data-token="keyword">fn</span> <span data-token="functionAndMethod">add</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="punctuation">,</span> <span data-token="parameter">other</span><span data-token="punctuation">:</span> <span data-token="type">Self</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="type">Self</span> <span data-token="punctuation">{</span>
            <span data-token="type">Self</span> <span data-token="punctuation">{</span>
                <span data-token="property">x</span><span data-token="operator">:</span> <span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">x</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="operator">.</span><span data-token="property">x</span><span data-token="punctuation">,</span>
                <span data-token="property">y</span><span data-token="operator">:</span> <span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="operator">.</span><span data-token="property">y</span><span data-token="punctuation">,</span>
            <span data-token="punctuation">}</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A struct that acts like a class</span>
    <span data-token="keyword">pub</span> <span data-token="keyword">struct</span> <span data-token="struct">DataService</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">pub</span> <span data-token="property">name</span><span data-token="operator">:</span> <span data-token="struct">String</span><span data-token="punctuation">,</span>
        <span data-token="comment">// A delegate/callback using a closure type</span>
        <span data-token="keyword">pub</span> <span data-token="property">on_update</span><span data-token="punctuation">:</span> <span data-token="struct">Box</span><span data-token="punctuation">&lt;</span><span data-token="keyword">dyn</span> <span data-token="interface">Fn</span><span data-token="punctuation">(</span><span data-token="typeParameter">T</span><span data-token="punctuation">)</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span>

    <span data-token="keyword">impl</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="struct">DataService</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
        <span data-token="comment">// Getter for a private field (read-only property)</span>
        <span data-token="keyword">pub</span> <span data-token="keyword">fn</span> <span data-token="functionAndMethod">name</span><span data-token="punctuation">(</span><span data-token="operator">&</span><span data-token="keyword">self</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="operator">&</span><span data-token="type">str</span> <span data-token="punctuation">{</span>
            <span data-token="operator">&</span><span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">name</span><span data-token="operator">.</span><span data-token="functionAndMethod">as_str</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Simple struct to demonstrate the IProcessable trait</span>
<span data-token="keyword">struct</span> <span data-token="struct">MyProcessor</span><span data-token="punctuation">;</span>
<span data-token="keyword">impl</span> <span data-token="namespace">core</span><span data-token="operator">::</span><span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="struct">String</span><span data-token="punctuation">&gt;</span> <span data-token="keyword">for</span> <span data-token="struct">MyProcessor</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">fn</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="operator">&</span><span data-token="keyword">mut</span> <span data-token="keyword">self</span><span data-token="punctuation">,</span> <span data-token="parameter">data</span><span data-token="operator">:</span> <span data-token="struct">String</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="macro">println!</span><span data-token="punctuation">(</span><span data-token="string">"Processing trait data:</span> <span data-token="punctuation">{}</span><span data-token="string">"</span><span data-token="punctuation">,</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Bring the trait into scope so its methods can be used</span>
<span data-token="keyword">use</span> <span data-token="keyword">crate<span data-token="operator">::</span><span data-token="namespace">core</span><span data-token="operator">::</span><span data-token="interface">IProcessable</span><span data-token="punctuation">;</spanspan>

<span data-token="keyword">fn</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">let</span> <span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token="module">core</span><span data-token="operator">::</span><span data-token="struct">Point</span> <span data-token="punctuation">{</span> <span data-token="property">x</span><span data-token="operator">:</span> <span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="property">y</span><span data-token="operator">:</span> <span data-token="number">20</span> <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="keyword">let</span> <span data-token="variable">p2</span> <span data-token="operator">=</span> <span data-token="module">core</span><span data-token="operator">::</span><span data-token="struct">Point</span> <span data-token="punctuation">{</span> <span data-token="property">x</span><span data-token="operator">:</span> <span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="property">y</span><span data-token="operator">:</span> <span data-token="number">8</span> <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="keyword">let</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">p1</span> <span data-token="operator">+</span> <span data-token="variable">p2</span><span data-token="punctuation">;</span> <span data-token="comment">// Uses the overloaded '+' operator</span>

    <span data-token="macro">println!</span><span data-token="punctuation">(</span><span data-token="string">"Result:</span> <span data-token="punctuation">{:?}</span><span data-token="string">"</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

    <span data-token="keyword">const</span> <span data-token="constant">PATH</span> <span data-token="operator">:</span> <span data-token="operator">&</span><span data-token="type">str</span> <span data-token="operator">=</span> <span data-token="string">r#"C:\\Users\\Rustacean\\Documents"#</span><span data-token="punctuation">;</span>
    <span data-token="macro">println!</span><span data-token="punctuation">(</span><span data-token="string">"Path:</span> <span data-token="punctuation">{}</span><span data-token="string">"</span><span data-token="punctuation">,</span> <span data-token="constant">PATH</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Create a list with both enum variants to ensure both are used</span>
    <span data-token="keyword">let</span> <span data-token="variable">statuses</span> <span data-token="operator">=</span> <span data-token="macro">vec!</span><span data-token="punctuation">[</span>
        <span data-token="namespace">core</span><span data-token="operator">::</span><span data-token="enum">Status</span><span data-token="operator">::</span><span data-token="enumMember">Pending</span><span data-token="punctuation">,</span>
        <span data-token="namespace">core</span><span data-token="operator">::</span><span data-token="enum">Status</span><span data-token="operator">::</span><span data-token="enumMember">Completed</span> <span data-token="punctuation">{</span> <span data-token="property">time</span><span data-token="operator">:</span> <span data-token="number">12345</span> <span data-token="punctuation">}</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">]</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Use a match statement to handle both variants and read the 'time' field</span>
    <span data-token="keyword">for</span> <span data-token="variable">status</span> <span data-token="keyword">in</span> <span data-token="variable">statuses</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">match</span> <span data-token="variable">status</span> <span data-token="punctuation">{</span>
            <span data-token="namespace">core</span><span data-token="operator">::</span><span data-token="enum">Status</span><span data-token="operator">::</span><span data-token="enumMember">Pending</span> <span data-token="operator">=&gt;</span> <span data-token="macro">println!</span><span data-token="punctuation">(</span><span data-token="string">"Status: Pending"</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
            <span data-token="namespace">core</span><span data-token="operator">::</span><span data-token="enum">Status</span><span data-token="operator">::</span><span data-token="enumMember">Completed</span> <span data-token="punctuation">{</span> <span data-token="property">time</span> <span data-token="punctuation">}</span> <span data-token="operator">=&gt;</span> <span data-token="punctuation">{</span>
                <span data-token="macro">println!</span><span data-token="punctuation">(</span><span data-token="string">"Status: Completed at time</span><span data-token="punctuation">{}</span><span data-token="string">"</span><span data-token="punctuation">,</span> <span data-token="variable">time</span><span data-token="punctuation">)</span>
            <span data-token="punctuation">}</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// Use the IProcessable trait implementation</span>
    <span data-token="keyword">let</span> <span data-token="keyword">mut</span> <span data-token="variable">processor</span> <span data-token="operator">=</span> <span data-token="struct">MyProcessor</span><span data-token="punctuation">;</span>
    <span data-token="variable">processor</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="string">"test data"</span><span data-token="operator">.</span><span data-token="functionAndMethod">to_string</span><span data-token="punctuation">(</span><span data-token="punctuation">))</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Construct DataService and use its methods and fields</span>
    <span data-token="keyword">let</span> <span data-token="variable">service</span> <span data-token="operator">=</span> <span data-token="namespace">core</span><span data-token="operator">::</span><span data-token="struct">DataService</span> <span data-token="punctuation">{</span>
        <span data-token="property">name</span><span data-token="operator">:</span> <span data-token="string">"My Service"</span><span data-token="operator">.</span><span data-token="functionAndMethod">to_string</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
        <span data-token="property">on_update</span><span data-token="punctuation">:</span> <span data-token="struct">Box</span><span data-token="operator">::</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="operator">|</span><span data-token="parameter">message</span><span data-token="operator">|</span> <span data-token="macro">println!</span><span data-token="punctuation">(</span><span data-token="string">"Update:</span> <span data-token="punctuation">{}</span><span data-token="string">"</span><span data-token="punctuation">,</span> <span data-token="parameter">message</span><span data-token="punctuation">))</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="macro">println!</span><span data-token="punctuation">(</span><span data-token="string">"Service Name:</span> <span date-token="punctuation">{}</span><span data-token="string">"</span><span data-token="punctuation">,</span> <span data-token="variable">service</span><span data-token="operator">.</span><span data-token="functionAndMethod">name</span><span data-token="punctuation">(</span><span data-token="punctuation">))</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">(</span><span data-token="variable">service</span><span data-token="operator">.</span><span data-token="property">on_update</span><span data-token="punctuation">)(</span><span data-token="string">"Service was used."</span><span data-token="operaptor">.</span><span data-token="functionAndMethod">to_string</span><span data-token="punctuation">(</span><span data-token="punctuation">))</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>
`;
