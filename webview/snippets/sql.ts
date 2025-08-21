export const sqlSnippet = `
<span data-token="comment">/*
 * SQL Snippet for Theme Preview
 * This script creates two tables, inserts data, and runs a query.
 * Tokens like 'decorator' or 'delegate' do not have SQL equivalents.
 */</span>

<span data-token="comment">-- Create a table for users</span>
<span data-token="keyword">CREATE</span> <span data-token="keyword">TABLE</span> <span data-token="namespace">dbo</span><span data-token="punctuation">.</span><span data-token="struct">Users</span> <span data-token="punctuation">(</span>
    <span data-token="fieldAndAttribute">UserID</span> <span data-token="type">INT</span> <span data-token="keyword">PRIMARY</span> <span data-token="keyword">KEY</span><span data-token="punctuation">,</span>
    <span data-token="fieldAndAttribute">Username</span> <span data-token="type">VARCHAR</span><span data-token="punctuation">(</span><span data-token="number">50</span><span data-token="punctuation">)</span> <span data-token="keyword">NOT</span> <span data-token="constant">NULL</span><span data-token="punctuation">,</span>
    <span data-token="fieldAndAttribute">RegistrationDate</span> <span data-token="type">DATETIME</span> <span data-token="keyword">DEFAULT</span> <span data-token="functionAndMethod">GETDATE</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
<span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">-- Create a table for orders</span>
<span data-token="keyword">CREATE</span> <span data-token="keyword">TABLE</span> <span data-token="namespace">dbo</span><span data-token="punctuation">.</span><span data-token="class">Orders</span> <span data-token="punctuation">(</span>
    <span data-token="fieldAndAttribute">OrderID</span> <span data-token="type">INT</span> <span data-token="keyword">PRIMARY</span> <span data-token="keyword">KEY</span><span data-token="punctuation">,</span>
    <span data-token="fieldAndAttribute">UserID</span> <span data-token="type">INT</span><span data-token="punctuation">,</span>
    <span data-token="fieldAndAttribute">Amount</span> <span data-token="type">DECIMAL</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">2</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
    <span data-token="comment">-- Simulate an ENUM with a CHECK constraint</span>
    <span data-token="fieldAndAttribute">Status</span> <span data-token="type">VARCHAR</span><span data-token="punctuation">(</span><span data-token="number">20</span><span data-token="punctuation">)</span> <span data-token="keyword">CHECK</span> <span data-token="punctuation">(</span><span data-token="fieldAndAttribute">Status</span> <span data-token="keyword">IN</span> <span data-token="punctuation">(</span><span data-token="string">'Pending'</span><span data-token="punctuation">,</span> <span data-token="string">'Completed'</span><span data-token="punctuation">)</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
    <span data-token="keyword">FOREIGN</span> <span data-token="keyword">KEY</span> <span data-token="punctuation">(</span><span data-token="fieldAndAttribute">UserID</span><span data-token="punctuation">)</span> <span data-token="keyword">REFERENCES</span> <span data-token="struct">Users</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">UserID</span><span data-token="punctuation">)</span>
<span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">-- Insert some data</span>
<span data-token="keyword">INSERT</span> <span data-token="keyword">INTO</span> <span data-token="struct">Users</span> <span data-token="punctuation">(</span><span data-token="fieldAndAttribute">UserID</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">Username</span><span data-token="punctuation">)</span> <span data-token="keyword">VALUES</span>
    <span data-token="punctuation">(</span><span data-token="number">1</span><span data-token="punctuation">,</span> <span data-token="string">'Alice'</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">(</span><span data-token="number">2</span><span data-token="punctuation">,</span> <span data-token="string">'Bob'</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">-- A complex query to get user order info</span>
<span data-token="keyword">SELECT</span>
    <span data-token="variable">u</span><span data-token="punctuation">.</span><span data-token="property">Username</span><span data-token="punctuation">,</span>
    <span data-token="functionAndMethod">COUNT</span><span data-token="punctuation">(</span><span data-token="variable">o</span><span data-token="punctuation">.</span><span data-token="property">OrderID</span><span data-token="punctuation">)</span> <span data-token="keyword">AS</span> <span data-token="property">TotalOrders</span><span data-token="punctuation">,</span>
    <span data-token="keyword">CASE</span>
        <span data-token="keyword">WHEN</span> <span data-token="functionAndMethod">COUNT</span><span data-token="punctuation">(</span><span data-token="variable">o</span><span data-token="punctuation">.</span><span data-token="property">OrderID</span><span data-token="punctuation">)</span> <span data-token="operator">&gt;</span> <span data-token="number">5</span> <span data-token="keyword">THEN</span> <span data-token="string">'VIP'</span>
        <span data-token="keyword">ELSE</span> <span data-token="string">'Standard'</span>
    <span data--token="keyword">END</span> <span data-token="keyword">AS</span> <span data-token="property">CustomerTier</span>
<span data-token="keyword">FROM</span>
    <span data-token="struct">Users</span> <span data-token="variable">u</span>
<span data-token="keyword">JOIN</span>
    <span data-token="class">Orders</span> <span data-token="variable">o</span> <span data-token="keyword">ON</span> <span data-token="variable">u</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">UserID</span> <span data-token="operator">=</span> <span data-token="variable">o</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">UserID</span>
<span data-token="keyword">WHERE</span>
    <span data-token="variable">u</span><span data-token="punctuation">.</span><span data-token="property">Username</span> <span data-token="keyword">LIKE</span> <span data-token="string">'A%'</span>
<span data-token="keyword">GROUP</span> <span data-token="keyword">BY</span>
    <span data-token="variable">u</span><span data-token="punctuation">.</span><span data-token="property">Username</span>
<span data-token="keyword">ORDER</span> <span data-token="keyword">BY</span>
    <span data-token="property">TotalOrders</span> <span data-token="keyword">DESC</span><span data-token="punctuation">;</span>

<span data-token="text">This is some plain text.</span>
`;
