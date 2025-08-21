export const htmlSnippet = `
<span data-token="punctuation">&lt;</span><span data-token="keyword">!DOCTYPE <span data-token="fieldAndAttribute">html</span></span><span data-token="punctuation">&gt;</span>
<span data-token="punctuation">&lt;</span><span data-token="keyword">html</span> <span data-token="fieldAndAttribute">lang</span><span data-token="operator">=</span><span data-token="string">"en"</span><span data-token="punctuation">&gt;</span>
<span data-token="punctuation">&lt;</span><span data-token="keyword">head</span><span data-token="punctuation">&gt;</span>
    <span data-token="punctuation">&lt;</span><span data-token="keyword">meta</span> <span data-token="fieldAndAttribute">charset</span><span data-token="punctuation">=</span><span data-token="string">"UTF-8"</span><span data-token="punctuation">&gt;</span>
    <span data-token="punctuation">&lt;</span><span data-token="keyword">title</span><span data-token="punctuation">&gt;</span><span data-token="text">HTML Snippet</span><span data-token="punctuation">&lt;/</span><span data-token="keyword">title</span><span data-token="punctuation">&gt;</span>
    <span data-token="punctuation">&lt;</span><span data-token="keyword">link</span> <span data-token="fieldAndAttribute">rel</span><span data-token="punctuation">=</span><span data-token="string">"stylesheet"</span> <span data-token="fieldAndAttribute">href</span><span data-token="punctuation">=</span><span data-token="string">"<u>style.css</u>"</span><span data-token="punctuation">&gt;</span>
<span data-token="punctuation">&lt;/</span><span data-token="keyword">head</span><span data-token="punctuation">&gt;</span>
<span data-token="punctuation">&lt;</span><span data-token="keyword">body</span><span data-token="punctuation">&gt;</span>

    <span data-token="comment">&lt;!-- This is a comment. Tokens like 'struct' or 'delegate' don't apply here. --&gt;</span>
    <span data-token="punctuation">&lt;</span><span data-token="keyword">header</span> <span data-token="fieldAndAttribute">id</span><span data-token="punctuation">=</span><span data-token="string">"page-header"</span><span data-token="punctuation">&gt;</span>
        <span data-token="punctuation">&lt;</span><span data-token="keyword">h1</span><span data-token="punctuation">&gt;</span><span data-token="text">Main Title</span><span data-token="punctuation">&lt;/</span><span data-token="keyword">h1</span><span data-token="punctuation">&gt;</span>
    <span data-token="punctuation">&lt;/</span><span data-token="keyword">header</span><span data-token="punctuation">&gt;</span>

    <span data-token="punctuation">&lt;</span><span data-token="keyword">div</span> <span data-token="fieldAndAttribute">class</span><span data-token="punctuation">=</span><span data-token="string">"container"</span><span data-token="punctuation">&gt;</span>
        <span data-token="punctuation">&lt;</span><span data-token="keyword">p</span><span data-token="punctuation">&gt;</span>
            <span data-token="text">A paragraph with some text and an HTML entity for copyright: </span><span data-token="constant">&amp;copy;</span> <span data-token="text">2025.</span>
        <span data-token="punctuation">&lt;/</span><span data-token="keyword">p</span><span data-token="punctuation">&gt;</span>
        
        <span data-token="comment">&lt;!-- An inline event handler simulates 'event' and 'function' tokens --&gt;</span>
        <span data-token="punctuation">&lt;</span><span data-token="keyword">button</span> <span data-token="fieldAndAttribute">type</span><span data-token="punctuation">=</span><span data-token="string">"button"</span> <span data-token="fieldAndAttribute">onclick</span><span data-token="punctuation">=</span><span data-token="string">"</span><span data-token="functionAndMethod">alert</span><span data-token="punctuation">(</span><span data-token="string">'Hello!'</span><span data-token="punctuation">)</span><span data-token="string">"</span><span data-token="punctuation">&gt;</span><span data-token="text">Click Me</span><span data-token="punctuation">&lt;/</span><span data-token="keyword">button</span><span data-token="punctuation">&gt;</span>
    <span data-token="punctuation">&lt;/</span><span data-token="keyword">div</span><span data-token="punctuation">&gt;</span>
    
    <span data-token="comment">&lt;!-- A script tag using type="module" here represented as string --&gt;</span>
    <span data-token="punctuation">&lt;</span><span data-token="keyword">script</span> <span data-token="fieldAndAttribute">type</span><span data-token="punctuation">=</span><span data-token="string">"module"</span> <span data-token="fieldAndAttribute">src</span><span data-token="punctuation">=</span><span data-token="string">"<u>main.js</u>"</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">&lt;/</span><span data-token="keyword">script</span><span data-token="punctuation">&gt;</span>

<span data-token="punctuation">&lt;/</span><span data-token="keyword">body</span><span data-token="punctuation">&gt;</span>
<span data-token="punctuation">&lt;/</span><span data-token="keyword">html</span><span data-token="punctuation">&gt;</span>
`;
