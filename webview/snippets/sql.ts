export const sqlSnippet = `
<span data-token="comment">/*
 * SQLite Snippet for Theme Preview
 * This script creates two tables, inserts data, and runs a query.
 * Tokens like 'decorator' or 'delegate' do not have SQL equivalents.
 *
 * In SQL there are no textmate scopes for punctuation and since 
 * table names and punctuations share the same textmate scope
 * (source.sql) i decided to colorize it like variables.
 */</span>

<span data-token="comment">-- Create a table for users</span>
<span data-token="keyword">CREATE</span> <span data-token="keyword">TABLE</span> <span data-token="functionAndMethod">Users</span> <span data-token="variable">(</span>
    <span data-token="variable">UserID</span> <span data-token="type">INTEGER</span> <span data-token="keyword">PRIMARY</span> <span data-token="keyword">KEY</span><span data-token="variable">,</span>
    <span data-token="variable">Username</span> <span data-token="type">TEXT</span> <span data-token="keyword">NOT</span> <span data-token="keyword">NULL</span><span data-token="variable">,</span>
    <span data-token="variable">RegistrationDate</span> <span data-token="type">TEXT</span> <span data-token="keyword">DEFAULT</span> <span data-token="keyword">CURRENT_TIMESTAMP</span>
<span data-token="variable">)</span><span data-token="variable">;</span>

<span data-token="comment">-- Create a table for orders</span>
<span data-token="keyword">CREATE</span> <span data-token="keyword">TABLE</span> <span data-token="functionAndMethod">Orders</span> <span data-token="variable">(</span>
    <span data-token="variable">OrderID</span> <span data-token="type">INTEGER</span> <span data-token="keyword">PRIMARY</span> <span data-token="keyword">KEY</span><span data-token="variable">,</span>
    <span data-token="variable">UserID</span> <span data-token="type">INTEGER</span><span data-token="variable">,</span>
    <span data-token="variable">Amount</span> <span data-token="type">REAL</span><span data-token="variable">,</span>
    <span data-token="comment">-- Simulate an ENUM with a CHECK constraint</span>
    <span data-token="keyword">Status</span> <span data-token="type">TEXT</span> <span data-token="keyword">CHECK</span> <span data-token="variable">(</span><span data-token="keyword">Status</span> <span data-token="keyword">IN</span> <span data-token="variable">(</span><span data-token="string">'Pending'</span><span data-token="variable">,</span> <span data-token="string">'Completed'</span><span data-token="variable">))</span><span data-token="variable">,</span>
    <span data-token="keyword">FOREIGN</span> <span data-token="keyword">KEY</span> <span data-token="variable">(</span><span data-token="variable">UserID</span><span data-token="variable">)</span> <span data-token="keyword">REFERENCES</span> <span data-token="variable">Users</span><span data-token="variable">(</span><span data-token="variable">UserID</span><span data-token="variable">)</span>
<span data-token="variable">)</span><span data-token="variable">;</span>

<span data-token="comment">-- Insert some data</span>
<span data-token="keyword">INSERT</span> <span data-token="keyword">INTO</span> <span data-token="variable">Users</span> <span data-token="variable">(</span><span data-token="variable">UserID</span><span data-token="variable">,</span> <span data-token="variable">Username</span><span data-token="variable">)</span> <span data-token="keyword">VALUES</span>
    <span data-token="variable">(</span><span data-token="number">1</span><span data-token="variable">,</span> <span data-token="string">'Alice'</span><span data-token="variable">)</span><span data-token="variable">,</span>
    <span data-token="variable">(</span><span data-token="number">2</span><span data-token="variable">,</span> <span data-token="string">'Bob'</span><span data-token="variable">)</span><span data-token="variable">;</span>

<span data-token="comment">-- A complex query to get user order info</span>
<span data-token="keyword">SELECT</span>
    <span data-token="constant">u</span><span data-token="variable">.</span><span data-token="constant">Username</span><span data-token="variable">,</span>
    <span data-token="functionAndMethod">COUNT</span><span data-token="variable">(</span><span data-token="constant">o</span><span data-token="variable">.</span><span data-token="constant">OrderID</span><span data-token="variable">)</span> <span data-token="keyword">AS</span> <span data-token="variable">TotalOrders</span><span data-token="variable">,</span>
    <span data-token="keyword">CASE</span>
        <span data-token="keyword">WHEN</span> <span data-token="functionAndMethod">COUNT</span><span data-token="variable">(</span><span data-token="constant">o</span><span data-token="variable">.</span><span data-token="constant">OrderID</span><span data-token="variable">)</span> <span data-token="operator">></span> <span data-token="number">5</span> <span data-token="keyword">THEN</span> <span data-token="string">'VIP'</span>
        <span data-token="keyword">ELSE</span> <span data-token="string">'Standard'</span>
    <span data-token="keyword">END</span> <span data-token="keyword">AS</span> <span data-token="variable">CustomerTier</span>
<span data-token="keyword">FROM</span>
    <span data-token="variable">Users</span> <span data-token="variable">u</span>
<span data-token="keyword">JOIN</span>
    <span data-token="variable">Orders</span> <span data-token="variable">o</span> <span data-token="keyword">ON</span> <span data-token="constant">u</span><span data-token="variable">.</span><span data-token="constant">UserID</span> <span data-token="operator">=</span> <span data-token="constant">o</span><span data-token="variable">.</span><span data-token="constant">UserID</span>
<span data-token="keyword">WHERE</span>
    <span data-token="constant">u</span><span data-token="variable">.</span><span data-token="constant">Username</span> <span data-token="keyword">LIKE</span> <span data-token="string">'A%'</span>
<span data-token="keyword">GROUP</span> <span data-token="keyword">BY</span>
    <span data-token="constant">u</span><span data-token="variable">.</span><span data-token="constant">Username</span>
<span data-token="keyword">ORDER</span> <span data-token="keyword">BY</span>
    <span data-token="variable">TotalOrders</span> <span data-token="keyword">DESC</span><span data-token="variable">;</span>
`;
