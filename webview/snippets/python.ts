export const pythonSnippet = `
<span data-token="keyword">from</span> <span data-token="module">enum</span> <span data-token="keyword">import</span> <span data-token="enum">Enum</span>
<span data-token="keyword">from</span> <span data-token="module">dataclasses</span> <span data-token="keyword">import</span> <span data-token="functionAndMethod">dataclass</span>
<span data-token="keyword">from</span> <span data-token="module">typing</span> <span data-token="keyword">import</span> <span data-token="class">TypeVar</span><span data-token="punctuation">,</span> <span data-token="class">Generic</span>

<span data-token="comment"># Using an Enum for status codes</span>
<span data-token="keyword">class</span> <span data-token="enum">Status</span><span data-token="punctuation">(</span><span data-token="enum">Enum</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
    <span data-token="enumMember">PENDING</span> <span data-token="operator">=</span> <span data-token="string">'pending'</span>
    <span data-token="enumMember">COMPLETED</span> <span data-token="operator">=</span> <span data-token="string">'completed'</span>

<span data-token="comment"># A TypeVar for generic programming (equivalent to C#'s <T>)</span>
<span data-token="comment"># In python it will be displayed as constant</span>
<span data-token="constant">T</span> <span data-token="operator">=</span> <span data-token="class">TypeVar</span><span data-token="punctuation">(</span><span data-token="string">'T'</span><span data-token="punctuation">)</span>

<span data-token="comment"># Using a decorator (serves as an "annotation")</span>
<span data-token="decorator">@dataclass</span><span data-token="punctuation">(</span><span data-token="parameter">frozen</span><span data-token="operator">=</span><span data-token="constant">True</span><span data-token="punctuation">)</span>
<span data-token="keyword">class</span> <span data-token="class">Point</span><span data-token="punctuation">:</span>
    <span data-token="property">x</span><span data-token="punctuation">:</span> <span data-token="type">int</span>
    <span data-token="property">y</span><span data-token="punctuation">:</span> <span data-token="type">int</span>

    <span data-token="comment"># Overloading the '+' operator</span>
    <span data-token="keyword">def</span> <span data-token="functionAndMethod">__add__</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="punctuation">,</span> <span data-token="parameter">other</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="keyword">return</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">x</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">)</span>

<span data-token="comment"># Simulating an "event" system</span>
<span data-token="comment"># For python there is no syntax highlighting for events</span>
<span data-token="keyword">class</span> <span data-token="class">EventManager</span><span data-token="punctuation">:</span>
    <span data-token="keyword">def</span> <span data-token="functionAndMethod">__init__</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="comment"># A delegate is a callable function reference</span>
        <span data-token="comment"># For python there is no syntax highlighting for delegates</span>
        <span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">_handlers</span> <span data-token="operator">=</span> <span data-token="punctuation">[</span><span data-token="punctuation">]</span>

    <span data-token="keyword">def</span> <span data-token="functionAndMethod">on_update</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="punctuation">,</span> <span data-token="parameter">handler</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">_handlers</span><span data-token="operator">.</span><span data-token="functionAndMethod">append</span><span data-token="punctuation">(</span><span data-token="parameter">handler</span><span data-token="punctuation">)</span>

<span data-token="keyword">class</span> <span data-token="class">DataProcessor</span><span data-token="punctuation">(</span><span data-token="class">Generic</span><span data-token="punctuation">[</span><span data-token="constant">T</span><span data-token="punctuation">]</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
    <span data-token="keyword">def</span> <span data-token="functionAndMethod">__init__</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">_version</span> <span data-token="operator">=</span> <span data-token="string">"1.0"</span>

    <span data-token="decorator">@property</span>
    <span data-token="keyword">def</span> <span data-token="propertyReadOnly">version</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="comment"># This is a read-only property</span>
        <span data-token="comment"># For python there is no syntax highlighting for read-only properties </span>
        <span data-token="keyword">return</span> <span data-token="keyword">self</span><span data-token="operator">.</span><span data-token="property">_version</span>

<span data-token="comment"># Example usage</span>
<span data-token="variable">point1</span> <span data-token="operator">=</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">)</span>
<span data-token="variable">point2</span> <span data-token="operator">=</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">)</span>
<span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">point1</span> <span data-token="operatorOverload">+</span> <span data-token="variable">point2</span>  <span data-token="comment"># Uses the overloaded operator</span>

<span data-token="constant">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14159</span>
<span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="type">f</span><span data-token="string">"Result: X=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="operator">.</span><span data-token="property">x</span><span data-token="punctuation">}</span><span data-token="string">, Y=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="operator">.</span><span data-token="property">y</span><span data-token="punctuation">}</span><span data-token="string">"</span><span data-token="punctuation">)</span>
`;
