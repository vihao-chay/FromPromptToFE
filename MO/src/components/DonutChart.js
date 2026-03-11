import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const DEFAULT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function deg2rad(deg) {
    return (deg * Math.PI) / 180;
}

/** Donut segment path: angle 0 = top, clockwise. Inner and outer radius. */
function segmentPath(cx, cy, innerR, outerR, startDeg, endDeg) {
    const start = deg2rad(startDeg);
    const end = deg2rad(endDeg);
    const x1 = cx + innerR * Math.sin(start);
    const y1 = cy - innerR * Math.cos(start);
    const x2 = cx + outerR * Math.sin(start);
    const y2 = cy - outerR * Math.cos(start);
    const x3 = cx + outerR * Math.sin(end);
    const y3 = cy - outerR * Math.cos(end);
    const x4 = cx + innerR * Math.sin(end);
    const y4 = cy - innerR * Math.cos(end);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${large} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${large} 0 ${x1} ${y1} Z`;
}

/** Touch (px, py) relative to center: return angle in degrees, 0 = top, clockwise. */
function touchToAngle(px, py, cx, cy) {
    const dx = px - cx;
    const dy = py - cy;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
}

export default function DonutChart({ data, size = 200, strokeWidth = 26, colors = DEFAULT_COLORS }) {
    const [activeIndex, setActiveIndex] = useState(null);

    if (!data || data.length === 0) {
        return (
            <View style={[styles.wrap, { width: size, height: size }]}>
                <Text style={styles.empty}>No data</Text>
            </View>
        );
    }

    const total = data.reduce((sum, d) => sum + Number(d.value), 0);
    if (total === 0) {
        return (
            <View style={[styles.wrap, { width: size, height: size }]}>
                <Text style={styles.empty}>No data</Text>
            </View>
        );
    }

    const cx = size / 2;
    const cy = size / 2;
    const outerR = (size / 2) - 8;
    const innerR = outerR - strokeWidth;

    const segments = data.map((entry, i) => {
        const value = Number(entry.value);
        const segmentAngle = (value / total) * 360;
        const startAngle = data.slice(0, i).reduce((s, d) => s + (Number(d.value) / total) * 360, 0);
        return { startAngle, endAngle: startAngle + segmentAngle, value, entry, color: colors[i % colors.length] };
    });

    const handleTouch = (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const angle = touchToAngle(locationX, locationY, cx, cy);
        const idx = segments.findIndex((s) => angle >= s.startAngle && angle < s.endAngle);
        if (idx >= 0) setActiveIndex(idx);
        else setActiveIndex(null);
    };

    const active = activeIndex != null ? segments[activeIndex] : null;

    return (
        <View
            style={[styles.wrap, { width: size }]}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onTouchEnd={() => setActiveIndex(null)}
            onTouchCancel={() => setActiveIndex(null)}
        >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((seg, i) => (
                    <Path
                        key={i}
                        d={segmentPath(cx, cy, innerR, outerR, seg.startAngle, seg.endAngle)}
                        fill={seg.color}
                        opacity={activeIndex === i ? 1 : activeIndex != null ? 0.5 : 1}
                    />
                ))}
            </Svg>
            {active != null && (
                <View style={[styles.tooltip, { left: size / 2 - 50, top: 8 }]} pointerEvents="none">
                    <Text style={styles.tooltipName} numberOfLines={1}>{active.entry.name}</Text>
                    <Text style={styles.tooltipValue}>{active.value} ({total > 0 ? Math.round((active.value / total) * 100) : 0}%)</Text>
                </View>
            )}
            <View style={[styles.legend, { width: size }]}>
                {data.map((entry, i) => {
                    const value = Number(entry.value);
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    const color = colors[i % colors.length];
                    return (
                        <View key={i} style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: color }]} />
                            <Text style={styles.legendLabel} numberOfLines={1}>{entry.name}</Text>
                            <Text style={styles.legendValue}>{value} ({pct}%)</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        justifyContent: "center",
    },
    empty: {
        fontSize: 14,
        color: "#64748b",
    },
    legend: {
        marginTop: 12,
        gap: 8,
    },
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        flex: 1,
        fontSize: 13,
        color: "#e2e8f0",
    },
    legendValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#94a3b8",
    },
    tooltip: {
        position: "absolute",
        minWidth: 100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#1e293b",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#475569",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    tooltipName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#e2e8f0",
        marginBottom: 2,
    },
    tooltipValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});
