import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, G, ClipPath, Rect, Circle } from "react-native-svg";

/**
 * Build smooth cubic Bezier path through points.
 */
function buildSmoothPath(points, tension = 0.25) {
    if (!points.length) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    const n = points.length;
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < n - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(n - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }
    return d;
}

export default function SmoothAreaChart({ data, width = 320, height = 200, color = "#6366f1", gradientOpacity = 0.4 }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const padding = { top: 14, right: 14, bottom: 40, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (!data || data.length === 0) {
        return (
            <View style={[styles.wrap, { width, height }]}>
                <Text style={styles.empty}>No data</Text>
            </View>
        );
    }

    const values = data.map((d) => Number(d.value));
    const maxVal = Math.max(...values, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;
    const topHeadroom = 0.12;
    const floorMargin = 18;
    const dataTopY = padding.top + chartHeight * topHeadroom;
    const dataBottomY = padding.top + chartHeight - floorMargin;

    const xStep = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
    const points = data.map((d, i) => ({
        x: padding.left + i * xStep,
        y: dataBottomY - ((Number(d.value) - minVal) / range) * (dataBottomY - dataTopY),
    }));

    const linePath = buildSmoothPath(points);
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const areaPath = `${linePath} L ${lastX} ${dataBottomY} L ${firstX} ${dataBottomY} Z`;

    const clipX = padding.left;
    const clipY = padding.top;

    const handleTouch = (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (locationY < padding.top || locationY > padding.top + chartHeight) {
            setActiveIndex(null);
            return;
        }
        let best = 0;
        let bestDist = Infinity;
        points.forEach((p, i) => {
            const d = (p.x - locationX) ** 2 + (p.y - locationY) ** 2;
            if (d < bestDist) {
                bestDist = d;
                best = i;
            }
        });
        setActiveIndex(best);
    };

    const activePoint = activeIndex != null ? points[activeIndex] : null;
    const activeItem = activeIndex != null ? data[activeIndex] : null;

    return (
        <View
            style={[styles.wrap, { width, height, overflow: "hidden" }]}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onTouchEnd={() => setActiveIndex(null)}
            onTouchCancel={() => setActiveIndex(null)}
        >
            <Svg width={width} height={height} style={{ overflow: "hidden" }}>
                <Defs>
                    <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={color} stopOpacity={gradientOpacity} />
                        <Stop offset="100%" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                    <ClipPath id="chartClip">
                        <Rect x={clipX} y={clipY} width={chartWidth} height={chartHeight} />
                    </ClipPath>
                </Defs>
                <G clipPath="url(#chartClip)">
                    <Path d={areaPath} fill="url(#areaGradient)" />
                    <Path
                        d={linePath}
                        fill="none"
                        stroke={color}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {activePoint && (
                        <Circle
                            cx={activePoint.x}
                            cy={activePoint.y}
                            r={6}
                            fill={color}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    )}
                </G>
            </Svg>
            {activeItem != null && activePoint != null && (
                <View
                    style={[
                        styles.tooltip,
                        {
                            left: Math.max(8, Math.min(width - 100, activePoint.x - 44)),
                            top: Math.max(4, activePoint.y - 36),
                        },
                    ]}
                    pointerEvents="none"
                >
                    <Text style={styles.tooltipLabel} numberOfLines={1}>{activeItem.name}</Text>
                    <Text style={styles.tooltipValue}>{activeItem.value}</Text>
                </View>
            )}
            <View style={[styles.xAxis, { width, paddingLeft: padding.left, paddingRight: padding.right }]}>
                {data.map((d, i) => (
                    <Text key={i} style={styles.xLabel} numberOfLines={1}>
                        {String(d.name)}
                    </Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: "relative",
    },
    empty: {
        position: "absolute",
        alignSelf: "center",
        top: "40%",
        fontSize: 14,
        color: "#64748b",
    },
    tooltip: {
        position: "absolute",
        minWidth: 72,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "#1e293b",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#475569",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    tooltipLabel: {
        fontSize: 11,
        color: "#94a3b8",
        marginBottom: 2,
    },
    tooltipValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    xAxis: {
        position: "absolute",
        bottom: 6,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        zIndex: 1,
    },
    xLabel: {
        fontSize: 10,
        color: "#64748b",
        flex: 1,
        textAlign: "center",
    },
});
