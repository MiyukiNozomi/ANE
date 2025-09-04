<script lang="ts">
  let {
    title,
    className = "",
    children,
  }: { title: string; className?: string; children: Function } = $props();

  let sunRays = new Array<{ x1: number; y1: number; x2: number; y2: number }>();

  {
    const centerX = 100;
    const centerY = 100;
    const sunRadius = 12;

    const minRadius = 53;
    const maxRadius = 60;

    const maxOddRadius = 50;
    const minOddRadius = sunRadius + 10;

    const subrayGap = 2;

    const randomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min)) + min;

    const calculateLine = (
      rad: number,
      startRadius: number,
      lineEndRadius: number
    ) => {
      const x1 = centerX + startRadius * Math.cos(rad);
      const y1 = centerY - startRadius * Math.sin(rad);

      const x2 = centerX + lineEndRadius * Math.cos(rad);
      const y2 = centerY - lineEndRadius * Math.sin(rad);

      sunRays.push({ x1, y1, x2, y2 });
    };

    let isOdd = false;

    const startAngle = -165; // -180;
    const endAngle = 165; // 180;

    for (let angle = startAngle; angle <= endAngle; angle += 15) {
      const rad = (angle * Math.PI) / 180;

      let thisLineRadius = isOdd
        ? randomInt(minOddRadius, maxOddRadius)
        : randomInt(minRadius, maxRadius);

      calculateLine(rad, sunRadius, thisLineRadius);

      if (isOdd) {
        const subrayCount = randomInt(1, 4);

        let minSubrayRadius = thisLineRadius + subrayGap;

        for (let i = 0; i < subrayCount; i++) {
          let thisSubrayRadius = randomInt(0, 10);

          calculateLine(
            rad,
            Math.min(maxRadius, minSubrayRadius),
            Math.min(maxRadius, thisSubrayRadius + minSubrayRadius)
          );

          minSubrayRadius += thisSubrayRadius + subrayGap;
        }
      }

      isOdd = !isOdd;
    }
  }
</script>

<div class="relative flex flex-col {className}">
  <p
    class="absolute left-1/2 transform -translate-x-1/2 -translate-y-[1.05rem] text-2xl text-orange-200"
  >
    ⯌
  </p>
  <div
    class="flex flex-col p-2 border-1 border-orange-200 bg-black rounded-t-full"
  >
    <div
      class="flex flex-col p-6 border-1 border-orange-200 bg-black rounded-t-full"
    >
      <div
        class="border-1 border-orange-200 border-b-0 bg-black rounded-t-full"
      >
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <!-- Explanation for future miyuki..
        
      M - Move to Point
      C - Cubic Bezier

      those values after 'C' are two control points, the final one is the last point
    
    -->
          <path
            id="arcPath"
            d="M 30,95 C 60,20 140,20 170,95"
            fill="none"
            stroke="none"
          />
          <text class="fill-orange-200 font-baskervville text-[1.5rem]">
            <textPath href="#arcPath" startOffset="50%" text-anchor="middle">
              {title.split("").join(" ")}
            </textPath>
          </text>
        </svg>
      </div>
      <div
        class="relative flex flex-row items-center border-x-1 border-orange-200 px-4 h-9"
      >
        <div class="absolute left-0 top-2/4 w-full transform rotate-180">
          <svg
            viewBox="0 0 200 100"
            xmlns="http://www.w3.org/2000/svg"
            class="w-full stroke-orange-200 transform -rotate-180 absolute top-0 left-0"
          >
            {#each sunRays as sunRay}
              <!-- The magic number here is to ensure its actually centered with the sun, because for some reason it wont be without this.-->
              <line
                x1={sunRay.x1 - 0.55}
                y1={sunRay.y1}
                x2={sunRay.x2 - 0.55}
                y2={sunRay.y2}
                stroke-width="1"
              />
            {/each}
          </svg>
        </div>

        <!-- bottom line-->
        <div class="bg-orange-200 w-full h-[2px]"></div>
        <p class=" text-orange-200 bg-black p-1 text-4xl rounded-full">✴</p>
        <div class="bg-orange-200 w-full h-[2px]"></div>
      </div>
      <div
        class="flex flex-col gap-3 pt-0 p-4 border-1 border-t-0 border-orange-200"
      >
        {@render children()}
      </div>
    </div>
  </div>
</div>
