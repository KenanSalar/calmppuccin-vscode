export const kotlinSnippet = `
<span data-token="comment">// Be aware that the kotlin language server behaves weird and shows different colorization as intended</span>

<span data-token="keyword">package</span> <span data-token="namespace">com.myapp.core</span>

<span data-token="keyword">import</span> <span data-token="namespace">java.util.</span><span data-token="class">Date</span>

<span data-token="comment">// A constant value</span>
<span data-token="keyword">const</span> <span data-token="keyword">val</span> <span data-token="propertyReadOnly">APP_VERSION</span> <span data-token="operator">=</span> <span data-token="string">"2.0"</span>

<span data-token="comment">// An enum class for status</span>
<span data-token="keyword">enum</span> <span data-token="keyword">class</span> <span data-token="class">Status</span><span data-token="punctuation">(</span><span data-token="keyword">val</span> <span data-token="parameter">code</span><span data-token="punctuation">:</span> <span data-token="class">Int</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="enumMember">PENDING</span><span data-token="punctuation">(</span><span data-token="number">0</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
    <span data-token="enumMember">COMPLETED</span><span data-token="punctuation">(</span><span data-token="number">1</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A type alias for a function type (delegate)</span>
<span data-token="keyword">typealias</span> <span data-token="class">UpdateHandler</span> <span data-token="operator">=</span> <span data-token="punctuation">(</span><span data-token="parameter">message</span><span data-token="punctuation">:</span> <span data-token="class">String</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="class">Unit</span>

<span data-token="comment">// A generic interface</span>
<span data-token="keyword">interface</span> <span data-token="class">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="class">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">fun</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">:</span> <span data-token="class">T</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A data class (struct equivalent) with an overloaded operator</span>
<span data-token="keyword">data</span> <span data-token="keyword">class</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="keyword">val</span> <span data-token="parameter">x</span><span data-token="punctuation">:</span> <span data-token="class">Int</span><span data-token="punctuation">,</span> <span data-token="keyword">val</span> <span data-token="parameter">y</span><span data-token="punctuation">:</span> <span data-token="class">Int</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">operator</span> <span data-token="keyword">fun</span> <span data-token="functionAndMethod">plus</span><span data-token="punctuation">(</span><span data-token="parameter">other</span><span data-token="punctuation">:</span> <span data-token="class">Point</span><span data-token="punctuation">)</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">Point</span><span data-token="punctuation">(</span><span data-token="propertyReadOnly">x</span> <span data-token="operator">+</span> <span data-token="constant">other</span><span data-token="punctuation">.</span><span data-token="propertyReadOnly">x</span><span data-token="punctuation">,</span> <span data-token="propertyReadOnly">y</span> <span data-token="operator">+</span> <span data-token="constant">other</span><span data-token="punctuation">.</span><span data-token="propertyReadOnly">y</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// An annotation can be used as a decorator</span>
<span data-token="annotation">@Suppress</span><span data-token="punctuation">(</span><span data-token="string">"unused"</span><span data-token="punctuation">)</span>
<span data-token="comment">// For some reason the language server interprets the IProcessable here as an interface and not everywhere</span>
<span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="punctuation">:</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="class">String</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="comment">// A read-only property</span>
    <span data-token="keyword">val</span> <span data-token="propertyReadOnly">creationDate</span><span data-token="punctuation">:</span> <span data-token="class">Date</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">Date</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
    <span data-token="comment">// A mutable property that simulates an event handler</span>
    <span data-token="keyword">var</span> <span data-token="property">onUpdate</span><span data-token="punctuation">:</span> <span data-token="class">UpdateHandler</span><span data-token="punctuation">?</span> <span data-token="operator">=</span> <span data-token="constant">null</span>

    <span data-token="keyword">override</span> <span data-token="keyword">fun</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">:</span> <span data-token="class">String</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="comment">// A multiline string with a template expression</span>
        <span data-token="comment">// logMessage here doesn't give a color token but the language server colors it as a read only property</span>
        <span data-token="keyword">val</span> <span data-token="propertyReadOnly">logMessage</span> <span data-token="operator">=</span> <span data-token="string">"""
            Processing data: "</span><span class="variable">$data</span><span data-token="string">"
            App Version:</span> <span class="variable">$APP_VERSION</span>
            <span data-token="string">"""</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">trimIndent</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
        
        <span data-token="property">onUpdate</span><span data-token="punctuation">?</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">invoke</span><span data-token="punctuation">(</span><span data-token="constant">logMessage</span><span data-token="punctuation">)</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// An extension method for the String class</span>
<span data-token="comment">// this is colored here as a function even though the color token is in the keyword section.</span>
<span data-token="keyword">fun</span> <span data-token="class">String</span><span data-token="punctuation">.</span><span data-token="extensionMethod">shout</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">=</span> <span data-token="functionAndMethod">this</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">uppercase</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">+</span> <span data-token="string">"!!!"</span>
`;
