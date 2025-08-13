export const powershellSnippet = `
<span data-token="comment">&lt;#
  This is a block comment.
  PowerShell uses modules to organize and share code.
#&gt;</span>
<span data-token="keyword">using</span> <span data-token="keyword">namespace</span> <span data-token="namespace">System<span data-token="punctuation">.</span>Collections<span data-token="punctuation">.</span>Generic</span>

<span data-token="comment"># An Enum for different status types</span>
<span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
    <span data-token="enumMember">Pending</span>
    <span data-token="enumMember">Completed</span>
<span data-token="punctuation">}</span>

<span data-token="comment"># A class can be used like a 'struct' for data structures</span>
<span data-token="keyword">class</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
    <span data-token="property">[int]</span><span data-token="variable">$X</span>
    <span data-token="property">[int]</span><span data-token="variable">$Y</span>
<span data-token="punctuation">}</span>

<span data-token="comment"># A class representing a service, like an "interface" by convention</span>
<span data-token="keyword">class</span> <span data-token="interface">IProcessable</span> <span data-token="punctuation">{</span>
    <span data-token="comment"># No direct operator overloading, this is a conceptual representation</span>
    <span data-token="type">[object]</span> <span data-token="operatorOverload">Add</span><span data-token="punctuation">(</span><span data-token="parameter">[object]</span><span data-token="variable">$other</span><span data-token="punctuation">)</span> <span data-token="punctuation">{}</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="keyword">:</span> <span data-token="interface">IProcessable</span> <span data-token="punctuation">{</span>
    <span data-token="comment"># A read-only property</span>
    <span data-token="propertyReadOnly">[string]</span><span data-token="variable">$Id</span> <span data-token="operator">=</span> <span data-token="punctuation">(</span><span data-token="functionAndMethod">New-Guid</span><span data-token="punctuation">)</span><span data-token="punctuation">.</span><span data-token="property">Guid</span>

    <span data-token="comment"># Simulating a delegate/event handler</span>
    <span data-token="delegate">[scriptblock]</span><span data-token="variable">$OnUpdate</span>

    <span data-token="comment"># A method with typed parameters</span>
    <span data-token="type">[void]</span> <span data-token="functionAndMethod">Process</span><span data-token="punctuation">(</span><span data-token="parameter">[string]</span><span data-token="variable">$message</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">if</span> <span data-token="punctuation">(</span><span data-token="variable">$this</span><span data-token="punctuation">.</span><span data-token="delegate">OnUpdate</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
            <span data-token="comment"># Invoke the event</span>
            <span data-token="keyword">.</span> <span data-token="variable">$this</span><span data-token="punctuation">.</span><span data-token="delegate">OnUpdate</span> <span data-token="variable">$message</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment"># A function that acts like an "extension method"</span>
<span data-token="keyword">function</span> <span data-token="extensionMethod">Get-TypeName</span> <span data-token="punctuation">{</span>
    <span data-token="decorator">[CmdletBinding()]</span>
    <span data-token="keyword">param</span> <span data-token="punctuation">(</span>
        <span data-token="decorator">[Parameter(Mandatory=$true, ValueFromPipeline=$true)]</span>
        <span data-token="parameter">[object]</span><span data-token="variable">$InputObject</span>
    <span data-token="punctuation">)</span>
    <span data-token="keyword">return</span> <span data-token="variable">$InputObject</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">GetType</span><span data-token="punctuation">()</span><span data-token="punctuation">.</span><span data-token="property">Name</span>
<span data-token="punctuation">}</span>

<span data-token="comment"># Using a constant variable</span>
<span data-token="functionAndMethod">Set-Variable</span> <span data-token="parameter">-Name</span> <span data-token="constant">PI</span> <span data-token="parameter">-Value</span> <span data-token="number">3.14</span> <span data-token="parameter">-Option</span> <span data-token="enumMember">Constant</span>

<span data-token="comment"># Here-String for verbatim, multi-line strings</span>
<span data-token="variable">$log</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">@"
Processing "Data"
ID: $($service.Id)
PI: $($PI)
"@</span>

<span data-token="variable">$service</span> <span data-token="operator">=</span> <span data-token="keyword">New-Object</span> <span data-token="class">DataService</span>
<span data-token="variable">$service</span><span data-token="punctuation">.</span><span data-token="event">OnUpdate</span> <span data-token="operator">=</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">param</span><span data-token="punctuation">(</span><span data-token="parameter">[string]</span><span data-token="variable">$msg</span><span data-token="punctuation">)</span>
    <span data-token="functionAndMethod">Write-Host</span> <span data-token="string">"Event triggered: $msg"</span>
<span data-token="punctuation">}</span>

<span data-token="text">This is some plain text.</span>
<span data-token="variable">$service</span> <span data-token="operator">|</span> <span data-token="extensionMethod">Get-TypeName</span>
<span data-token="variable">$service</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Process</span><span data-token="punctuation">(</span><span data-token="variable">$log</span><span data-token="punctuation">)</span>
`;
