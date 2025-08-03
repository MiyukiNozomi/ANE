<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import { onMount } from "svelte";
  import { on } from "svelte/events";

  let background: HTMLCanvasElement | undefined = $state();

  let mouseX = 0;
  let mouseY = 0;

  let lastMouseX = 0;
  let lastMouseY = 0;

  function genStar() {
    const x = Math.random() * background!.width;
    const y = Math.random() * background!.height;

    const color = `${Math.random() * 55 + 200}, ${Math.random() * 55 + 200}, ${Math.random() * 55 + 200}`;

    return {
      x,
      y,
      movementVectorX: Math.random() * (Math.random() > 0.5 ? -1 : 1),
      movementVectorY: Math.random() * (Math.random() > 0.5 ? -1 : 1),

      scale: Math.floor(Math.random() * 3) + 1,

      speed: Math.floor(Math.random() * 4) + 1,
      color,
    };
  }

  onMount(() => {
    let ctx = background?.getContext("2d");
    if (!ctx || !background) return;

    let stars: Array<{
      x: number;
      y: number;

      movementVectorX: number;
      movementVectorY: number;

      scale: number;
      speed: number;

      color: string;
    }> = [];

    background.width = background.parentElement!.clientWidth;
    background.height = background.parentElement!.clientHeight;

    const starCount = Math.floor(Math.random() * 256) + 128;

    for (let i = 0; i < starCount; i++) {
      stars.push(genStar());
    }

    function gameLoop() {
      if (!ctx || !background) return;

      background.width = background.parentElement!.clientWidth;
      background.height = background.parentElement!.clientHeight;

      ctx.fillStyle = "#000000";
      ctx.fillRect(
        0,
        0,
        background.parentElement!.clientWidth,
        background.parentElement!.clientHeight
      );

      for (let j = 0; j < starCount; j++) {
        let star = stars[j];

        ctx.fillStyle = `rgb(${star.color}, 1)`;
        ctx.fillRect(
          star.x - star.scale / 2,
          star.y - star.scale / 2,
          star.scale,
          star.scale
        );

        ctx.beginPath();
        ctx.arc(
          star.x - star.scale / 2,
          star.y - star.scale / 2,
          star.scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        star.x += star.movementVectorX * star.speed;
        star.y += star.movementVectorY * star.speed;

        if (star.x < 0 || star.x > background.width)
          star.movementVectorX = Math.random() * (star.x < 0 ? 1 : -1);
        if (star.y < 0 || star.y > background.height)
          star.movementVectorY = Math.random() * (star.y < 0 ? 1 : -1);

        if (
          star.x < -100 ||
          star.y < -100 ||
          star.x > background.width + 100 ||
          star.y > background.height + 100
        ) {
          stars[j] = genStar();
        }

        if (star.speed > 8) star.speed = 8;

        // cursor
        if (lastMouseX != 0 && lastMouseY != 0) {
          const distanceToCursor = Math.sqrt(
            Math.pow(mouseX - star.x, 2) + Math.pow(mouseY - star.y, 2)
          );

          if (distanceToCursor < 10) {
            star.speed *= 2;
          }
        }

        if (star.speed <= 6) {
          for (let d = 0; d < starCount; d++) {
            if (d == j) continue;

            let other = stars[d];

            const distance = Math.sqrt(
              Math.pow(other.x - star.x, 2) + Math.pow(other.y - star.y, 2)
            );

            if (distance > 40) {
              continue;
            }
            if (distance < 10) {
              other.movementVectorX *= -1;
              other.movementVectorY *= -1;
              other.speed++;

              star.speed--;
            }

            // bound!
            other.movementVectorX = star.movementVectorX;
            other.movementVectorY = star.movementVectorY;

            ctx.strokeStyle = `rgba(${other.color}, ${distance / 40.0})`;

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(star.x - star.scale / 2, star.y - star.scale / 2);
            ctx.lineTo(other.x - other.scale / 2, other.y - other.scale / 2);
            ctx.stroke();
          }
        }
      }

      setTimeout(() => window.requestAnimationFrame(gameLoop), 20);
    }

    gameLoop();
  });
</script>

<svelte:window
  on:mousemove={(e) => {
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    mouseX = e.pageX;
    mouseY = e.pageY;
  }}
/>

<div class="font-mplus2 min-h-screen bg-slate-900 text-white flex flex-col">
  <div class="absolute w-full h-full z-10">
    <canvas bind:this={background}></canvas>
  </div>
  <div class="flex flex-col h-screen z-20">
    <Header />
    <div class="h-fullflex flex-col text-center md:text-start relative">
      <p class="text-4xl font-mplus2 p-16 md:p-24">
        Constructing crazy ideas into projects since 2017!
      </p>
    </div>
  </div>
  <Footer />
</div>
