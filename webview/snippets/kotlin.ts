export const kotlinSnippet = `
<span data-token="keyword">package</span> <span data-token="namespace">com<span data-token="punctuation">.</span>myapp<span data-token="punctuation">.</span>core</span>

<span data-token="keyword">import</span> <span data-token="module">java<span data-token="punctuation">.</span>util<span data-token="punctuation">.</span>Date</span>

<span data-token="comment">// A constant value</span>
<span data-token="keyword">const</span> <span data-token="keyword">val</span> <span data-token="constant">APP_VERSION</span> <span data-token="operator">=</span> <span data-token="string">"2.0"</span>

<span data-token="comment">// An enum class for status</span>
<span data-token="keyword">enum</span> <span data-token="keyword">class</span> <span data-token="enum">Status</span><span data-token="punctuation">(</span><span data-token="keyword">val</span> <span data-token="property">code</span><span data-token="punctuation">:</span> <span data-token="type">Int</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="enumMember">PENDING</span><span data-token="punctuation">(</span><span data-token="number">0</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
    <span data-token="enumMember">COMPLETED</span><span data-token="punctuation">(</span><span data-token="number">1</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A type alias for a function type (delegate)</span>
<span data-token="keyword">typealias</span> <span data-token="delegate">UpdateHandler</span> <span data-token="operator">=</span> <span data-token="punctuation">(</span><span data-token="parameter">message</span><span data-token="punctuation">:</span> <span data-token="type">String</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="type">Unit</span>

<span data-token="comment">// A generic interface</span>
<span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">fun</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">:</span> <span data-token="typeParameter">T</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A data class (struct equivalent) with an overloaded operator</span>
<span data-token="keyword">data</span> <span data-token="keyword">class</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="keyword">val</span> <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="type">Int</span><span data-token="punctuation">,</span> <span data-token="keyword">val</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="type">Int</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">operator</span> <span data-token="keyword">fun</span> <span data-token="operatorOverload">plus</span><span data-token="punctuation">(</span><span data-token="parameter">other</span><span data-token="punctuation">:</span> <span data-token="struct">Point</span><span data-token="punctuation">)</span> <span data-token="operator">=</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">x</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// An annotation can be used as a decorator</span>
<span data-token="annotation">@Suppress</span><span data-token="punctuation">(</span><span data-token="string">"unused"</span><span data-token="punctuation">)</span>
<span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="punctuation">:</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="type">String</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="comment">// A read-only property</span>
    <span data-token="keyword">val</span> <span data-token="propertyReadOnly">creationDate</span><span data-token="punctuation">:</span> <span data-token="type">Date</span> <span data-token="operator">=</span> <span data-token="class">Date</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
    <span data-token="comment">// A mutable property that simulates an event handler</span>
    <span data-token="keyword">var</span> <span data-token="event">onUpdate</span><span data-token="punctuation">:</span> <span data-token="delegate">UpdateHandler</span><span data-token="operator">?</span> <span data-token="operator">=</span> <span data-token="constant">null</span>

    <span data-token="keyword">override</span> <span data-token="keyword">fun</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">:</span> <span data-token="type">String</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="comment">// A multiline string (verbatim) with a template expression</span>
        <span data-token="keyword">val</span> <span data-token="variable">logMessage</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">"""
            Processing data: "$<span class="parameter">data</span>"
            App Version: $<span class="constant">APP_VERSION</span>
            """</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">trimIndent</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
        
        <span data-token="event">onUpdate</span><span data-token="operator">?</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">invoke</span><span data-token="punctuation">(</span><span data-token="variable">logMessage</span><span data-token="punctuation">)</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// An extension method for the String class</span>
<span data-token="keyword">fun</span> <span data-token="type">String</span><span data-token="punctuation">.</span><span data-token="extensionMethod">shout</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">=</span> <span data-token="keyword">this</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">uppercase</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">+</span> <span data-token="string">"!!!"</span>

<span data-token="text">This is some plain text.</span>
`;
