export const cppSnippet = `
<span data-token="comment">// For c++ devs i recommend changing the type color</span>
<span data-token="annotation">#</span><span data-token="keyword">include</span> <span data-token="string">&lt;iostream&gt;</span>
<span data-token="annotation">#</span><span data-token="keyword">include</span> <span data-token="string">&lt;string&gt;</span>
<span data-token="annotation">#</span><span data-token="keyword">include</span> <span data-token="string">&lt;vector&gt;</span>
<span data-token="annotation">#</span><span data-token="keyword">include</span> <span data-token="string">&lt;functional&gt;</span>

<span data-token="comment">// Use a namespace to organize code</span>
<span data-token="keyword">namespace</span> <span data-token="namespace">MyApp</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">using</span> <span data-token="type">Module</span> <span data-token="operator">=</span> <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="type">ostream</span><span data-token="punctuation">;</span>

    <span data-token="comment">// A scoped enum for status codes</span>
    <span data-token="keyword">enum</span> <span data-token="keyword">class</span> <span data-token="type">Status</span> <span data-token="punctuation">{</span> <span data-token="enumMember">Pending</span><span data-token="punctuation">,</span> <span data-token="enumMember">Completed</span> <span data-token="punctuation">}</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Typedef for a function pointer, like a delegate</span>
    <span data-token="keyword">using</span> <span data-token="type">UpdateHandler</span> <span data-token="operator">=</span> <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="type">function</span><span data-token="punctuation">&lt;</span><span data-token="type">void</span><span data-token="punctuation">(</span><span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="type">string</span><span data-token="punctuation">)</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">;</span>

    <span data-token="comment">// A struct for a Point</span>
    <span data-token="keyword">struct</span> <span data-token="type">Point</span> <span data-token="punctuation">{</span>
        <span data-token="type">int</span> <span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="property">y</span><span data-token="punctuation">;</span>
        <span data-token="comment">// Operator overloading</span>
        <span data-token="type">Point</span> <span data-token="operatorOverload">operator+</span><span data-token="punctuation">(</span><span data-token="keyword">const</span> <span data-token="type">Point</span> <span data-token="operator">&</span><span data-token="parameter">other</span><span data-token="punctuation">)</span> <span data-token="keyword">const</span> <span data-token="punctuation">{</span>
            <span data-token="keyword">return</span> <span data-token="punctuation">{</span><span data-token="property">x</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="operator">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="property">y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">}</span><span data-token="punctuation">;</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span><span data-token="punctuation">;</span>

    <span data-token="comment">// An "interface" using a pure virtual function</span>
    <span data-token="keyword">template</span><span data-token="punctuation">&lt;</span><span data-token="keyword">typename</span> <span data-token="type">T</span><span data-token="punctuation">&gt;</span>
    <span data-token="keyword">class</span> <span data-token="type">IProcessable</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">public</span><span data-token="punctuation">:</span>
        <span data-token="keyword">virtual</span> <span data-token="type">void</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="type">T</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span> <span data-token="operator">=</span> <span data-token="number">0</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span><span data-token="punctuation">;</span>

    <span data-token="keyword">class</span> <span data-token="type">DataService</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">private</span><span data-token="punctuation">:</span>
        <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="type">string</span> <span data-token="property">_name</span><span data-token="punctuation">;</span>
    <span data-token="keyword">public</span><span data-token="punctuation">:</span>
        <span data-token="comment">// Event simulation but shown as a property</span>
        <span data-token="type">UpdateHandler</span> <span data-token="property">onUpdate</span><span data-token="punctuation">;</span>

        <span data-token="comment">// A C++17 attribute (decorator) but shown as attribute</span>
        <span data-token="punctuation">[[</span><span data-token="fieldAndAttribute">nodiscard</span><span data-token="punctuation">]]</span>
        <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="type">string</span> <span data-token="functionAndMethod">getName</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="keyword">const</span> <span data-token="punctuation">{</span> <span data-token="keyword">return</span> <span data-token="property">_name</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A free function (like an extension method)</span>
<span data-token="type">void</span> <span data-token="extensionMethod">print_point</span><span data-token="punctuation">(</span><span data-token="keyword">const</span> <span data-token="namespace">MyApp</span><span data-token="operator">::</span><span data-token="type">Point</span> <span data-token="operator">&</span><span data-token="parameter">p</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="variable">cout</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="string">"Point(x: "</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="parameter">p</span><span data-token="punctuation">.</span><span data-token="property">x</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="string">", y: "</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="parameter">p</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="string">")"</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="functionAndMethod">endl</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="type">int</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">using</span> <span data-token="keyword">namespace</span> <span data-token="namespace">MyApp</span><span data-token="punctuation">;</span>

    <span data-token="keyword">const</span> <span data-token="type">double</span> <span data-token="variable">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14159</span><span data-token="punctuation">;</span>
    <span data-token="type">Point</span> <span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token="punctuation">{</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="type">Point</span> <span data-token="variable">p2</span> <span data-token="operator">=</span> <span data-token="punctuation">{</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">}</span><span data-token="punctuation">;</span>
    <span data-token="type">Point</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">p1</span> <span data-token="operatorOverload">+</span> <span data-token="variable">p2</span><span data-token="punctuation">;</span> <span data-token="comment">// Calls overloaded operator</span>

    <span data-token="functionAndMethod">print_point</span><span data-token="punctuation">(</span><span data-token="variable">result</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

    <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="type">string</span> <span data-token="variable">path</span> <span data-token="operator">=</span> <span data-token="string">R"(C:\\\\Path\\\\To\\\\File.txt)"</span><span data-token="punctuation">;</span>
    <span data-token="namespace">std</span><span data-token="operator">::</span><span data-token="variable">cout</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="variable">path</span> <span data-token="operatorOverload">&lt;&lt;</span> <span data-token="string">"</span><span data-token="constant">\\n</span><span data-token="string">"</span><span data-token="punctuation">;</span>

    <span data-token="keyword">return</span> <span data-token="number">0</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>
`;
