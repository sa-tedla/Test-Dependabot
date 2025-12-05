<script lang="ts">
  // The mobile breakpoint determines at what screen width to shift to mobile
  // behaviour. The two behaviour changes are: 1) *only* the left or right panel
  // are allowed to be open, making one visible will hide the other, and 2) the
  // content panel slides to the side, instead of adjusting the width, and a
  // scrim/touch-panel is laid over the content, so that tapping the scrim
  // will hide the panel.
  import { isChatSidebarVisible } from '$lib/stores/isChatSidebarVisible';

  export let mobileBreakpoint = 500;

  // When in mobile mode the content area is overlayed with a touch area, called
  // a scrim (named after the theater drop), so that tapping it closes the panel.
  // You'll want to make sure this touch area is wide enough that people can
  // easily and accurately touch it.
  export let scrimWidth = '70px';

  // The scrim is given 50% opacity, so the content panel is still visible. You
  // can adjust the scrim color to re-brand the scrim, or to change to a light
  // or dark theme.
  export let scrimColor = '#444';

  // These attributes control the window width at which the left/right panels will
  // automatically open (when resizing bigger) or automatically close (when resizing
  // smaller). These also control whether the component initializes with the panels
  // open or closed. To opt out of this automated behaviour, set the property to false.
  export let leftOpenBreakpoint = 768;

  export let width = '341px';
  export let duration = '0.2s';

  // =============== end of exports ===============

  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();
  let windowWidth;

  const onTransitionEnd = ({ propertyName }) => {
    if (propertyName === 'left' || propertyName === 'width') {
      dispatch('change', { left: $isChatSidebarVisible });
    }
  };

  const setPanelStates = () => () => {
    windowWidth = window.innerWidth;
    if (leftOpenBreakpoint && windowWidth < leftOpenBreakpoint) {
      isChatSidebarVisible.set(false);
    }
    dispatch('change', { left: $isChatSidebarVisible });
  };

  onMount(setPanelStates(false));

  const commonStyles = `
    position: absolute;
		top: 79px;
		bottom: 0;
		overflow-y: auto;
	`;

  $: mobileMode = windowWidth < mobileBreakpoint;
  $: mobilePanelWidth = `calc(100% - ${scrimWidth})`;

  const makeMenuStyle = (side, width) => `
		${commonStyles}
		${side}: 0;
		width: ${width};
	`;
  $: leftMenuStyle = makeMenuStyle(
    'left',
    mobileMode ? mobilePanelWidth : width,
    mobileMode && $isChatSidebarVisible ? '3' : '2'
  );

  $: contentLeft = mobileMode
    ? ($isChatSidebarVisible && `calc(100% - ${scrimWidth})` && `calc(${scrimWidth} - 100%)`) ||
      '0px'
    : $isChatSidebarVisible
      ? width
      : '0px';
  $: contentWidth = mobileMode ? '100%' : `calc(100% - ${$isChatSidebarVisible ? width : '0px'})`;
  $: contentStyle = `
		${commonStyles}
		left: ${contentLeft};
		width: ${contentWidth};
		transition: width ${duration} ease-in-out, left ${duration} ease-in-out;
	`;
</script>

<svelte:window on:resize={setPanelStates(true)} />

<div class="h-full w-full overflow-hidden">
  {#if $$slots.left}
    <div style={leftMenuStyle}>
      <slot name="left" />
    </div>
  {/if}

  <div style={contentStyle} on:transitionend={onTransitionEnd}>
    <slot name="content" />
  </div>
</div>
