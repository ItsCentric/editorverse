const targets: { ratio: number; cls: string }[] = [
  { ratio: 1, cls: "aspect-square" },
  { ratio: 16 / 9, cls: "aspect-video" },
  { ratio: 4 / 3, cls: "aspect-[4/3]" },
  { ratio: 3 / 4, cls: "aspect-[3/4]" },
];

export default function useAspectRatioMappings() {
  return (width: number, height: number) => {
    const ratio = width / height;

    return targets.reduce((closest, curr) => {
      const currDiff = Math.abs(ratio - curr.ratio);
      const bestDiff = Math.abs(ratio - closest.ratio);
      return currDiff < bestDiff ? curr : closest;
    });
  };
}
