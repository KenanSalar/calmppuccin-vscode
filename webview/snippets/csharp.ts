export const csharpSnippet = `
<span data-token="keyword">namespace</span> <span data-token="namespace">MyApp<span data-token="operator">.</span>Core</span><span data-token="punctuation">;</span>
<span data-token="keyword">using</span> <span data-token="class">Module</span> <span data-token="operator">=</span> <span data-token="namespace">System</span><span data-token="operator">.</span><span data-token="class">Console</span><span data-token="punctuation">;</span>

<span data-token="keyword">public</span> <span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span> <span data-token="enumMember">Pending</span><span data-token="punctuation">,</span> <span data-token="enumMember">Completed</span> <span data-token="punctuation">}</span>
<span data-token="keyword">public</span> <span data-token="keyword">delegate</span> <span data-token="type">void</span> <span data-token="delegate">UpdateHandler</span><span data-token="punctuation">(</span><span data-token="type">string</span> <span data-token="parameter">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="keyword">public</span> <span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="keyword">where</span> <span data-token="typeParameter">T</span> <span data-token="punctuation">:</span> <span data-token="keyword">struct</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">event</span> <span data-token="delegate">UpdateHandler</span><span data-token="operator">?</span> <span data-token="event">OnUpdate</span><span data-token="punctuation">;</span>
    <span data-token="typeParameter">T</span> <span data-token="property">Data</span> <span data-token="punctuation">{</span> <span data-token="keyword">get</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Using a record struct for an immutable data type</span>
<span data-token="keyword">public</span> <span data-token="keyword">readonly</span> <span data-token="keyword">record</span> <span data-token="keyword">struct</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="type">int</span> <span data-token="parameter">X</span><span data-token="punctuation">,</span> <span data-token="type">int</span> <span data-token="parameter">Y</span><span data-token="punctuation">)</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="struct">Point</span> <span data-token="keyword">operator</span> <span data-token="operator">+</span><span data-token="punctuation">(</span><span data-token="struct">Point</span> <span data-token="parameter">a</span><span data-token="punctuation">,</span> <span data-token="struct">Point</span> <span data-token="parameter">b</span><span data-token="punctuation">)</span>
        <span data-token="operator">=></span> <span data-token="keyword">new</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="operator">.</span><span data-token="property">X</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="operator">.</span><span data-token="property">X</span><span data-token="punctuation">,</span> <span data-token="parameter">a</span><span data-token="operator">.</span><span data-token="property">Y</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="operator">.</span><span data-token="property">Y</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">public</span> <span data-token="keyword">class</span> <span data-token="class">Calculator</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="type">void</span> <span data-token="functionAndMethod">RunExample</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
    <span data-token="punctuation">{</span>
        <span data-token="comment">// Two instances of the Point struct</span>
        <span data-token="keyword">var</span> <span data-token="variable">point1</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        <span data-token="keyword">var</span> <span data-token="variable">point2</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

        <span data-token="comment">// Using the overloaded '+' operator</span>
        <span data-token="struct">Point</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">point1</span> <span data-token="operatorOverload">+</span> <span data-token="variable">point2</span><span data-token="punctuation">;</span>

        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="string">$"Result: X=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">X</span><span data-token="punctuation">}</span><span data-token="string">, Y=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">Y</span><span data-token="punctuation">}</span><span data-token="string">"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Using primary constructors for dependency injection</span>
<span data-token="keyword">public</span> <span data-token="keyword">class</span> <span data-token="class">DataService</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">(</span><span data-token="interface">ILogger</span> <span data-token="parameter">logger</span><span data-token="punctuation">)</span> <span data-token="keyword">where</span> <span data-token="typeParameter">T</span> <span data-token="punctuation">:</span> <span data-token="keyword">struct</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">private readonly</span> <span data-token="struct">Guid</span> <span data-token="fieldAndAttribute">_id</span> <span data-token="operator">=</span> <span data-token="struct">Guid</span><span data-token="operator">.</span><span data-token="functionAndMethod">NewGuid</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="keyword">public</span> <span data-token="keyword">required</span> <span data-token="type">string</span> <span data-token="property">Name</span> <span data-token="punctuation">{</span> <span data-token="keyword">get</span><span data-token="punctuation">;</span> <span data-token="keyword">init</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>

    <span data-token="keyword">public</span> <span data-token="type">void</span> <span data-token="functionAndMethod">Process</span><span data-token="punctuation">(</span><span data-token="typeParameter">T</span><span data-token="operator">?</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span>
    <span data-token="punctuation">{</span>
        <span data-token="comment">// Using extension method</span>
        <span data-token="parameter">logger</span><span data-token="punctuation">.</span><span data-token="extensionMethod">GetTypeName</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

        <span data-token="keyword">const</span> <span data-token="type">double</span> <span data-token="constant">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14</span><span data-token="punctuation">;</span>
        <span data-token="keyword">var</span> <span data-token="variable">message</span> <span data-token="operator">=</span> <span data-token="parameter">data</span> <span data-token="operator">is</span> <span data-token="operator">not</span> <span data-token="constant">null</span>
            <span data-token="operator">?</span> <span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="extensionMethod">GetTypeName</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
            <span data-token="operator">:</span> <span data-token="string">"No data"</span><span data-token="punctuation">;</span>

        <span data-token="comment">// Using a raw, interpolated string literal</span>
        <span data-token="keyword">var</span> <span data-token="variable">log</span> <span data-token="operator">=</span> <span data-token="string">$$"""
            Processing "</span><span data-token="string">{</span><span data-token="punctuation">{</span><span data-token="variable">message</span><span data-token="punctuation">}</span><span data-token="string">}</span><span data-token="string">"
            ID: </span><span data-token="string">{</span><span data-token="punctuation">{</span><span data-token="fieldAndAttribute">_id</span><span data-token="punctuation">}</span><span data-token="string">}</span><span data-token="string">
            PI: </span><span data-token="string">{</span><span data-token="punctuation">{</span><span data-token="constant">PI</span><span data-token="punctuation">}</span><span data-token="string">}</span><span data-token="string">
            """</span><span data-token="punctuation">;</span>

        <span data-token="comment">// Using a verbatim string literal</span>
        <span data-token="type">string</span><span data-token="operator">?</span> <span data-token="variable">verbatim</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">@"C:\\Path\\To\\File.txt"</span><span data-token="punctuation">;</span>

        <span data-token="comment">// Using string escape character</span>
        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="string">"C:</span><span data-token="constant">\\\\</span><span data-token="string">Path</span><span data-token="constant">\\\\</span><span data-token="string">To</span><span data-token="constant">\\\\</span><span data-token="string">File.txt"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="variable">log</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="variable">verbatim</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

<span data-token="punctuation">[</span><span data-token="namespace">System</span><span data-token="operator">.</span><span data-token="namespace">Diagnostics</span><span data-token="operator">.</span><span data-token="namespace">CodeAnalysis</span><span data-token="operator">.</span><span data-token="class">ExcludeFromCodeCoverage</span><span data-token="punctuation">]</span>
<span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="keyword">class</span> <span data-token="class">ObjectExtensions</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="type">string</span> <span data-token="extensionMethod">GetTypeName</span><span data-token="punctuation">(</span><span data-token="keyword">this</span> <span data-token="type">object</span> <span data-token="parameter">_</span><span data-token="punctuation">)</span>
        <span data-token="operator">=></span> <span data-token="string">"System.Object"</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>
`;
