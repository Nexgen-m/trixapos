import * as React from "react";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={`tabs-container ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, { value, onValueChange })
      )}
    </div>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="tabs-list">{children}</div>;
}

export function TabsTrigger({ value, children, onValueChange }: any) {
  return (
    <button className={`tabs-trigger ${value ? "active" : ""}`} onClick={() => onValueChange(value)}>
      {children}
    </button>
  );
}
