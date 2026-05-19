"use client";

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { getAvailableVariables, AvailableVariables } from "../services/salaryConcept.service";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onValidate?: () => void;
  isValidating?: boolean;
  className?: string;
}

export default function FormulaEditor({
  value,
  onChange,
  onValidate,
  isValidating,
  className,
}: Props) {
  const [variables, setVariables] = useState<AvailableVariables | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVars, setFilteredVars] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch available variables on mount
  useEffect(() => {
    const fetchVars = async () => {
      try {
        const data = await getAvailableVariables();
        setVariables(data);
      } catch (error) {
        console.error("Error fetching variables:", error);
      }
    };
    fetchVars();
  }, []);

  // Get all variable names for autocomplete
  const getAllVariableNames = (): string[] => {
    if (!variables) return [];
    const names: string[] = [
      ...variables.systemVars.map((v) => v.name),
      ...variables.attendanceVars.map((v) => v.name),
      ...variables.conceptCodes,
      ...variables.inputVars,
    ];
    return names.sort();
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCursorPos(e.target.selectionStart);

    // Check if user typed a trigger character (like typing a variable name)
    const textBeforeCursor = newValue.substring(0, e.target.selectionStart);
    const match = textBeforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    
    if (match && variables) {
      const partial = match[0].toLowerCase();
      const allVars = getAllVariableNames();
      const filtered = allVars.filter(
        (v) => v.toLowerCase().includes(partial) && v.toLowerCase() !== partial
      );
      
      if (filtered.length > 0) {
        setFilteredVars(filtered);
        setShowSuggestions(true);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const insertVariable = (varName: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || "";
    
    // Find the start of the current word to replace
    const textBeforeCursor = currentValue.substring(0, start);
    const wordMatch = textBeforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    const wordStart = wordMatch ? start - wordMatch[0].length : start;
    
    const newValue =
      currentValue.substring(0, wordStart) + varName + currentValue.substring(end);
    onChange(newValue);
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      const newPos = wordStart + varName.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
    
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const allVars = getAllVariableNames();

  return (
    <div className="relative">
      <div className="flex gap-2 align-items-start">
        <div className="flex-1 relative">
          <InputTextarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className={`font-monospace w-full ${className || ""}`}
            rows={3}
            placeholder="ej. (A + C) / 5 * 1.5"
            style={{ fontFamily: "monospace" }}
          />
          
          {/* Quick variable insertion buttons */}
          {variables && (
            <div className="flex flex-wrap gap-1 mt-1">
              <small className="w-full text-color-secondary mb-1">
                Insertar variable:
              </small>
              {variables.systemVars.slice(0, 3).map((v) => (
                <Tag
                  key={v.name}
                  value={v.name}
                  severity="info"
                  className="cursor-pointer text-xs"
                  onClick={() => insertVariable(v.name)}
                />
              ))}
              {variables.attendanceVars.slice(0, 3).map((v) => (
                <Tag
                  key={v.name}
                  value={v.name}
                  severity="warning"
                  className="cursor-pointer text-xs"
                  onClick={() => insertVariable(v.name)}
                />
              ))}
              {variables.conceptCodes.slice(0, 3).map((code) => (
                <Tag
                  key={code}
                  value={code}
                  severity="success"
                  className="cursor-pointer text-xs font-monospace"
                  onClick={() => insertVariable(code)}
                />
              ))}
            </div>
          )}
        </div>
        
        {onValidate && (
          <button
            type="button"
            onClick={onValidate}
            disabled={isValidating || !value?.trim()}
            className="p-button p-component p-button-secondary p-button-outlined"
            style={{ whiteSpace: "nowrap", alignSelf: "flex-start" }}
          >
            <i
              className={`pi ${isValidating ? "pi-spin pi-spinner" : "pi-check-circle"} mr-1`}
            />
            Validar
          </button>
        )}
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredVars.length > 0 && (
        <div
          className="absolute z-5 surface-0 border-1 surface-border border-round shadow-2 mt-1"
          style={{ maxHeight: "200px", overflowY: "auto", minWidth: "200px" }}
        >
          {filteredVars.map((v) => (
            <div
              key={v}
              className="p-2 cursor-pointer hover:surface-100"
              onClick={() => insertVariable(v)}
              onMouseEnter={(e) =>
                (e.currentTarget.className = "p-2 cursor-pointer surface-200")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.className = "p-2 cursor-pointer hover:surface-100")
              }
            >
              <code className="font-monospace">{v}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
