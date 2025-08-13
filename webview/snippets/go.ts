export const goSnippet = `
<span data-token="keyword">package</span> <span data-token="namespace">main</span>

<span data-token="keyword">import</span> <span data-token="punctuation">(</span>
	<span data-token="string">"</span><span data-token="module">fmt</span><span data-token="string">"</span>
	<span data-token="string">"</span><span data-token="module">time</span><span data-token="string">"</span>
<span data-token="punctuation">)</span>

<span data-token="comment">// Using iota to create an enum for Status</span>
<span data-token="keyword">type</span> <span data-token="enum">Status</span> <span data-token="type">int</span>
<span data-token="keyword">const</span> <span data-token="punctuation">(</span>
	<span data-token="enumMember">Pending</span> <span data-token="enum">Status</span> <span data-token="operator">=</span> <span data-token="keyword">iota</span>
	<span data-token="enumMember">Completed</span>
<span data-token="punctuation">)</span>

<span data-token="comment">// A function type, similar to a delegate</span>
<span data-token="keyword">type</span> <span data-token="delegate">UpdateHandler</span> <span data-token="keyword">func</span><span data-token="punctuation">(</span><span data-token="parameter">message</span> <span data-token="type">string</span><span data-token="punctuation">)</span>

<span data-token="comment">// An interface for processable items</span>
<span data-token="keyword">type</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">[</span><span data-token="typeParameter">T</span> <span data-token="keyword">any</span><span data-token="punctuation">]</span> <span data-token="keyword">interface</span> <span data-token="punctuation">{</span>
	<span data-token="functionAndMethod">Process</span><span data-token="punctuation">(</span><span data-token="parameter">data</span> <span data-token="typeParameter">T</span><span data-token="punctuation">)</span> <span data-token="type">error</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A struct for a Point</span>
<span data-token="keyword">type</span> <span data-token="struct">Point</span> <span data-token="keyword">struct</span> <span data-token="punctuation">{</span>
	<span data-token="fieldAndAttribute">X</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">Y</span> <span data-token="type">int</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A method on Point (Go doesn't have operator overloading)</span>
<span data-token="keyword">func</span> <span data-token="punctuation">(</span><span data-token="parameter">p</span> <span data-token="struct">Point</span><span data-token="punctuation">)</span> <span data-token="functionAndMethod">Add</span><span data-token="punctuation">(</span><span data-token="parameter">other</span> <span data-token="struct">Point</span><span data-token="punctuation">)</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
	<span data-token="keyword">return</span> <span data-token="struct">Point</span><span data-token="punctuation">{</span><span data-token="fieldAndAttribute">X</span><span data-token="punctuation">:</span> <span data-token="parameter">p</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">X</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">X</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">Y</span><span data-token="punctuation">:</span> <span data-token="parameter">p</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">Y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">Y</span><span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A class-like struct with an event channel</span>
<span data-token="keyword">type</span> <span data-token="class">DataService</span> <span data-token="keyword">struct</span> <span data-token="punctuation">{</span>
	<span data-token="comment">// Struct tags are a form of annotation</span>
	<span data-token="property">Name</span>      <span data-token="type">string</span>    <span data-token="annotation">\`json:"name"\`</span>
	<span data-token="event">UpdateEvent</span> <span data-token="keyword">chan</span> <span data-token="type">string</span> <span data-token="comment">// Using a channel for events</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">func</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
	<span data-token="variable">service</span> <span data-token="operator">:=</span> <span data-token="operator">&</span><span data-token="class">DataService</span><span data-token="punctuation">{</span>
		<span data-token="property">Name</span><span data-token="punctuation">:</span>      <span data-token="string">"Primary Service"</span><span data-token="punctuation">,</span>
		<span data-token="event">UpdateEvent</span><span data-token="punctuation">:</span> <span data-token="functionAndMethod">make</span><span data-token="punctuation">(</span><span data-token="keyword">chan</span> <span data-token="type">string</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
	<span data-token="punctuation">}</span>

	<span data-token="comment">// A goroutine to listen for events</span>
	<span data-token="keyword">go</span> <span data-token="keyword">func</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
		<span data-token="keyword">for</span> <span data-token="variable">msg</span> <span data-token="operator">:=</span> <span data-token="keyword">range</span> <span data-token="variable">service</span><span data-token="punctuation">.</span><span data-token="event">UpdateEvent</span> <span data-token="punctuation">{</span>
			<span data-token="namespace">fmt</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Println</span><span data-token="punctuation">(</span><span data-token="string">"Event Received:"</span><span data-token="punctuation">,</span> <span data-token="variable">msg</span><span data-token="punctuation">)</span>
		<span data-token="punctuation">}</span>
	<span data-token="punctuation">}</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>

	<span data-token="variable">service</span><span data-token="punctuation">.</span><span data-token="event">UpdateEvent</span> <span data-token="operator">&lt;-</span> <span data-token="string">"Processing started"</span>

	<span data-token="variable">p1</span> <span data-token="operator">:=</span> <span data-token="struct">Point</span><span data-token="punctuation">{</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">}</span>
	<span data-token="variable">p2</span> <span data-token="operator">:=</span> <span data-token="struct">Point</span><span data-token="punctuation">{</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">}</span>
	<span data-token="variable">result</span> <span data-token="operator">:=</span> <span data-token="variable">p1</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Add</span><span data-token="punctuation">(</span><span data-token="variable">p2</span><span data-token="punctuation">)</span>

	<span data-token="comment">// A raw string literal (verbatim)</span>
	<span data-token="namespace">fmt</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Printf</span><span data-token="punctuation">(</span><span data-token="stringVerbatim">\`Result: %+v</span><span class="constant">\n</span><span data-token="stringVerbatim">\`</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">)</span>
	<span data-token="text">This is some plain text.</span>

	<span data-token="namespace">time</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Sleep</span><span data-token="punctuation">(</span><span data-token="number">100</span> <span data-token="operator">*</span> <span data-token="namespace">time</span><span data-token="punctuation">.</span><span data-token="constant">Millisecond</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>
`;
