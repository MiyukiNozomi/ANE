<script lang="ts">
  let {
    title,
    className = "",
    children,
  }: { title: string; className?: string; children: Function } = $props();
</script>

<div class="relative flex flex-col {className}">
  <p
    class="absolute left-1/2 transform -translate-x-1/2 -translate-y-[1.05rem] text-2xl text-orange-200"
  >
    ⯌
  </p>
  <div
    class="flex flex-col p-6 border-1 border-orange-200 bg-black rounded-t-full"
  >
    <div class="border-1 border-orange-200 border-b-0 bg-black rounded-t-full">
      <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Explanation for future miyuki..
        
      M - Move to Point
      C - Cubic Bezier

      those values after 'C' are two control points, the final one is the last point
    
    -->
        <path
          id="arcPath"
          d="M 30,100 C 60,25 140,25 170,100"
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
      <!-- light rays -->
      <!-- left side -->
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom -rotate-[15deg] w-px h-13 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom -rotate-[30deg] w-px h-15 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom -rotate-[45deg] w-px h-10 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom -rotate-[60deg] w-px h-16 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom -rotate-[75deg] w-px h-11 bg-orange-200"
      ></div>

      <!-- center -->
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom rotate-[0deg] w-px h-18 bg-orange-200"
      ></div>

      <!-- right side -->
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom rotate-[15deg] w-px h-11 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom rotate-[30deg] w-px h-17 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom rotate-[45deg] w-px h-10 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom rotate-[60deg] w-px h-15 bg-orange-200"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4 origin-bottom rotate-[75deg] w-px h-12 bg-orange-200"
      ></div>

      <!-- bottom line-->

      <p
        class="absolute left-1/2 transform -translate-x-2/4 text-2xl text-orange-200 bg-black p-1 text-center w-9 aspect-square rounded-full"
      >
        ✴
      </p>
      <div class="bg-orange-200 w-full h-[2px]"></div>
      <div class="bg-orange-200 w-full h-[2px]"></div>
    </div>
    <div class="flex flex-col pt-0 p-4 border-1 border-t-0 border-orange-200">
      {@render children()}
    </div>
  </div>
</div>
