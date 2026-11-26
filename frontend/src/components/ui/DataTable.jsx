    import "./DataTable.css";
    import StatusMessage from "./StatusMessage";
    import Button from "./Button";
    
    export default function DataTable({
    columns,
    data,
    loading = false,
    error = "",
    onRetry,
    emptyMessage = "No hay datos para mostrar.",
    }) {

    const gridTemplateColumns = columns.map((c) => c.width || "1fr").join(" ");

    return (
        <div className="sportify-table-wrap">
        <div className="sportify-table" style={{ "--table-cols": gridTemplateColumns }}>
            {/* HEADER */}
            <div className="sportify-thead">
            {columns.map((col) => (
                <div key={col.key} className={`sportify-th ${col.align === "right" ? "is-right" : ""}`}>
                {col.label}
                </div>
            ))}
            </div>

            {/* BODY */}
            <div className="sportify-tbody">
            {loading ? (
                <div className="sportify-table-empty">Cargando datos...</div>
            ) : error ? (
                <div className="sportify-table-empty">
                <StatusMessage message={error} />
                {onRetry && (
                    <div style={{ marginTop: 12 }}>
                    <Button onClick={onRetry}>Reintentar</Button>
                    </div>
                )}
                </div>
            ) : data.length === 0 ? (
                <div className="sportify-table-empty">{emptyMessage}</div>
            ) : (
                data.map((row, index) => (
                <div key={row.id || row.idComplejo || row.idUsuario || index} className="sportify-row">
                    {columns.map((col) => (
                    <div key={col.key} className={`sportify-cell ${col.align === "right" ? "is-right" : ""}`}>
                        {col.render(row)}
                    </div>
                    ))}
                </div>
                ))
            )}
            </div>
        </div>
        </div>
    );
    }