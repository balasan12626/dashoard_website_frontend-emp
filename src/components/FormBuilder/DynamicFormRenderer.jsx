import { useState, useCallback, useRef } from "react";

function DynamicField({ field, value, onChange, errors }) {
  const fieldError = errors?.find(e => e.field === field.key);
  const hasError = !!fieldError;
  const inputId = `field-${field.key}`;

  const commonProps = {
    id: inputId,
    value: value ?? field.defaultValue ?? "",
    onChange: e => onChange(field.key, e.target.value),
    placeholder: field.placeholder || "",
    disabled: field.disabled,
  };

  const wrapperStyle = {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const labelStyle = {
    fontWeight: 500,
    fontSize: "14px",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const inputStyle = {
    padding: "10px 12px",
    border: hasError ? "1px solid #ef4444" : "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s",
    background: "#fff",
    color: "#111827",
    width: "100%",
    boxSizing: "border-box",
  };

  const errorStyle = {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "2px",
  };

  const descriptionStyle = {
    color: "#6b7280",
    fontSize: "12px",
    marginTop: "2px",
  };

  const selectStyle = { ...inputStyle, appearance: "menulist" };

  const renderField = () => {
    switch (field.type) {
      case "textarea":
        return <textarea {...commonProps} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} rows={4} />;

      case "dropdown":
      case "multiselect":
        return (
          <select
            {...commonProps}
            multiple={field.type === "multiselect"}
            style={selectStyle}
            onChange={e => {
              if (field.type === "multiselect") {
                const selected = Array.from(e.target.selectedOptions, o => o.value);
                onChange(field.key, selected);
              } else {
                onChange(field.key, e.target.value);
              }
            }}
          >
            {!field.required && <option value="">-- Select --</option>}
            {(field.options || []).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => onChange(field.key, e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#6366f1" }}
            />
            <span style={labelStyle}>{field.checkboxLabel || field.label}</span>
          </label>
        );

      case "radio":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {(field.options || []).map(opt => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name={`radio-${field.key}`}
                  value={opt.value}
                  checked={String(value) === String(opt.value)}
                  onChange={e => onChange(field.key, e.target.value)}
                  style={{ accentColor: "#6366f1" }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case "boolean":
        return (
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => onChange(field.key, e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "#6366f1" }}
            />
            <span style={labelStyle}>{field.label}</span>
          </label>
        );

      case "toggle":
        return (
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 0" }}>
            <div style={{
              position: "relative",
              width: "44px",
              height: "24px",
              background: value ? "#6366f1" : "#d1d5db",
              borderRadius: "12px",
              transition: "background 0.2s",
            }}>
              <div style={{
                position: "absolute",
                top: "2px",
                left: value ? "22px" : "2px",
                width: "20px",
                height: "20px",
                background: "#fff",
                borderRadius: "50%",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => onChange(field.key, e.target.checked)}
              style={{ display: "none" }}
            />
            <span style={labelStyle}>{field.label}</span>
          </label>
        );

      case "date":
        return <input type="date" {...commonProps} style={inputStyle} />;

      case "time":
        return <input type="time" {...commonProps} style={inputStyle} />;

      case "datetime":
        return <input type="datetime-local" {...commonProps} style={inputStyle} />;

      case "number":
      case "decimal":
      case "currency":
      case "percentage":
        return (
          <div style={{ position: "relative" }}>
            {field.prefix && <span style={{ position: "absolute", left: "12px", top: "10px", color: "#6b7280", fontSize: "14px" }}>{field.prefix}</span>}
            <input
              type="number"
              {...commonProps}
              step={field.step || "any"}
              min={field.min}
              max={field.max}
              style={{
                ...inputStyle,
                paddingLeft: field.prefix ? "28px" : "12px",
                paddingRight: field.suffix ? "28px" : "12px",
              }}
            />
            {field.suffix && <span style={{ position: "absolute", right: "12px", top: "10px", color: "#6b7280", fontSize: "14px" }}>{field.suffix}</span>}
          </div>
        );

      case "file":
      case "image":
        return (
          <input
            type="file"
            id={inputId}
            accept={field.type === "image" ? "image/*" : undefined}
            onChange={e => onChange(field.key, e.target.files[0]?.name || "")}
            style={inputStyle}
          />
        );

      case "color":
        return <input type="color" {...commonProps} style={{ ...inputStyle, padding: "4px", height: "44px" }} />;

      case "rating":
        const maxRating = field.maxRating || 5;
        return (
          <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
            {Array.from({ length: maxRating }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(field.key, n)}
                style={{
                  fontSize: "28px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 2px",
                  color: n <= (value || 0) ? "#f59e0b" : "#d1d5db",
                  transition: "color 0.15s",
                }}
              >
                {n <= (value || 0) ? "\u2605" : "\u2606"}
              </button>
            ))}
          </div>
        );

      case "signature":
        return <SignaturePad field={field} value={value} onChange={(v) => onChange(field.key, v)} inputId={inputId} />;

      case "hidden":
        return null;

      case "email":
        return <input type="email" {...commonProps} style={inputStyle} />;

      case "password":
        return <input type="password" {...commonProps} style={inputStyle} />;

      case "phone":
        return <input type="tel" {...commonProps} style={inputStyle} />;

      case "url":
        return <input type="url" {...commonProps} style={inputStyle} />;

      case "nested_object":
        return (
          <div style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#f9fafb" }}>
            <div style={{ fontWeight: 600, fontSize: "13px", color: "#6b7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {field.label}
            </div>
            {(field.nestedFields || []).map(nf => (
              <DynamicField
                key={nf.key}
                field={{ ...nf, key: `${field.key}.${nf.key}` }}
                value={value?.[nf.key]}
                onChange={(compoundKey, val) => {
                  const [, ...rest] = compoundKey.split(".");
                  onChange(field.key, { ...(value || {}), [rest.join(".")]: val });
                }}
                errors={errors}
              />
            ))}
          </div>
        );

      case "nested_array":
        return (
          <div style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#f9fafb" }}>
            <div style={{ fontWeight: 600, fontSize: "13px", color: "#6b7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {field.label}
            </div>
            {(value || []).map((item, idx) => (
              <div key={idx} style={{ padding: "8px", marginBottom: "8px", border: "1px dashed #d1d5db", borderRadius: "4px" }}>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>Item {idx + 1}</div>
                {(field.arrayFields || []).map(af => (
                  <DynamicField
                    key={af.key}
                    field={{ ...af, key: `${field.key}[${idx}].${af.key}` }}
                    value={item?.[af.key]}
                    onChange={(compoundKey, val) => {
                      onChange(field.key, (value || []).map((it, i) =>
                        i === idx ? { ...it, [compoundKey.split(".").pop()]: val } : it
                      ));
                    }}
                    errors={errors}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = (value || []).filter((_, i) => i !== idx);
                    onChange(field.key, updated);
                  }}
                  style={{ marginTop: "8px", padding: "4px 12px", fontSize: "12px", color: "#ef4444", background: "none", border: "1px solid #ef4444", borderRadius: "4px", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange(field.key, [...(value || []), {}])}
              style={{ padding: "6px 16px", fontSize: "13px", color: "#6366f1", background: "none", border: "1px solid #6366f1", borderRadius: "4px", cursor: "pointer" }}
            >
              + Add Item
            </button>
          </div>
        );

      case "address":
        return (
          <div style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#f9fafb" }}>
            {["street", "city", "state", "zip", "country"].map(sub => (
              <div key={sub} style={{ marginBottom: "8px" }}>
                <label style={{ ...labelStyle, fontSize: "12px", marginBottom: "2px", textTransform: "capitalize" }}>{sub}</label>
                <input
                  type="text"
                  value={(value || {})[sub] || ""}
                  onChange={e => onChange(field.key, { ...(value || {}), [sub]: e.target.value })}
                  placeholder={`Enter ${sub}`}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        );

      case "geo":
        return (
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: "12px" }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={(value || {}).lat ?? ""}
                onChange={e => onChange(field.key, { ...(value || {}), lat: parseFloat(e.target.value) || 0 })}
                placeholder="Latitude"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: "12px" }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={(value || {}).lng ?? ""}
                onChange={e => onChange(field.key, { ...(value || {}), lng: parseFloat(e.target.value) || 0 })}
                placeholder="Longitude"
                style={inputStyle}
              />
            </div>
          </div>
        );

      default:
        return <input type="text" {...commonProps} style={inputStyle} />;
    }
  };

  if (field.type === "checkbox") {
    return <div style={wrapperStyle}>{renderField()}</div>;
  }

  return (
    <div style={wrapperStyle}>
      <label htmlFor={inputId} style={labelStyle}>
        {field.label}
        {field.required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {field.description && <div style={descriptionStyle}>{field.description}</div>}
      {renderField()}
      {hasError && <div style={errorStyle}>{fieldError.message}</div>}
    </div>
  );
}

function SignaturePad({ field, value, onChange, inputId }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onChange("");
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        id={inputId}
        width={400}
        height={120}
        style={{ border: "1px solid #d1d5db", borderRadius: "6px", width: "100%", height: "120px", cursor: "crosshair", touchAction: "none" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button type="button" onClick={clear} style={{ marginTop: "6px", padding: "4px 12px", fontSize: "12px", color: "#6b7280", background: "none", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}>Clear</button>
    </div>
  );
}

const WIDTH_MAP = { "25": "25%", "50": "50%", "75": "75%", "100": "100%" };

export default function DynamicFormRenderer({ fields, values, onChange, onSubmit, errors, submitText, children }) {
  const handleChange = useCallback((key, val) => {
    onChange?.({ ...values, [key]: val });
  }, [values, onChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "8px 24px",
    width: "100%",
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <div style={containerStyle}>
        {fields.filter(f => f.type !== "hidden").map(field => {
          const w = WIDTH_MAP[field.width] || field.width || "100%";
          const isFull = field.type === "nested_object" || field.type === "nested_array" || field.type === "address" || w === "100%";
          return (
            <div key={field.key} style={isFull ? { gridColumn: "1 / -1" } : {}}>
              <div style={{ width: w }}>
                <DynamicField
                  field={field}
                  value={values[field.key]}
                  onChange={handleChange}
                  errors={errors || []}
                />
              </div>
            </div>
          );
        })}
      </div>
      {children}
      {onSubmit && (
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="submit"
            style={{
              padding: "10px 32px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {submitText || "Submit"}
          </button>
        </div>
      )}
    </form>
  );
}
