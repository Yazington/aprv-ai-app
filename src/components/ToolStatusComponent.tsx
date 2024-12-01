export default ({ activeTools }: { activeTools: Record<string, string> }) => {
  return (
    <div>
      <h2>Active Tools</h2>
      <ul>
        {Object.entries(activeTools).map(([tool, status]) => (
          <li key={tool}>
            {tool}: {status}
          </li>
        ))}
      </ul>
    </div>
  );
};
