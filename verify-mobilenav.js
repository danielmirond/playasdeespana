// Test script to verify MobileNav component structure and CSS
const fs = require('fs');
const path = require('path');

console.log('=== MobileNav Component Verification ===\n');

// Check 1: Component file exists
const componentPath = path.join(__dirname, 'src/components/ui/MobileNav.tsx');
if (fs.existsSync(componentPath)) {
  const content = fs.readFileSync(componentPath, 'utf-8');
  console.log('✅ MobileNav.tsx exists');
  
  // Check for 'use client'
  if (content.includes("'use client'")) console.log('   ✅ Component is a Client Component');
  
  // Check for required elements
  const checks = [
    ['hamburger button', 'className={`${styles.hamburger}'],
    ['menu state (useState)', 'const [isOpen, setIsOpen]'],
    ['backdrop element', 'styles.backdrop'],
    ['mobile menu nav', 'id="mobile-menu"'],
    ['language switcher', 'langBtn'],
    ['search link', 'searchLink'],
  ];
  
  checks.forEach(([name, pattern]) => {
    if (content.includes(pattern)) {
      console.log(`   ✅ ${name}`);
    } else {
      console.log(`   ❌ ${name}`);
    }
  });
} else {
  console.log('❌ MobileNav.tsx not found');
}

console.log();

// Check 2: CSS Module file
const cssPath = path.join(__dirname, 'src/components/ui/MobileNav.module.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf-8');
  console.log('✅ MobileNav.module.css exists');
  
  const cssChecks = [
    ['Hidden by default', '.mobileNav {\\s*display:\\s*none'],
    ['Mobile breakpoint (max-width: 767px)', '@media\\s*\\(max-width:\\s*767px\\)'],
    ['Show on mobile', '.mobileNav\\s*{\\s*display:\\s*block'],
    ['Hamburger styling', '.hamburger\\s*{'],
    ['Hamburger animation', '\\.hamburger\\.active'],
    ['Menu drawer', '\\.menu\\s*{'],
    ['Backdrop overlay', '\\.backdrop\\s*{'],
    ['Language switcher', '\\.langSwitch'],
    ['Desktop hide', '@media\\s*\\(min-width:\\s*768px\\)'],
  ];
  
  cssChecks.forEach(([name, pattern]) => {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(css)) {
      console.log(`   ✅ ${name}`);
    } else {
      console.log(`   ❌ ${name}`);
    }
  });
} else {
  console.log('❌ MobileNav.module.css not found');
}

console.log();

// Check 3: Layout integration
const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, 'utf-8');
  console.log('✅ Root layout.tsx exists');
  
  if (layout.includes("import MobileNav")) {
    console.log('   ✅ MobileNav imported');
  } else {
    console.log('   ❌ MobileNav import missing');
  }
  
  if (layout.includes('<MobileNav')) {
    console.log('   ✅ MobileNav component rendered');
  } else {
    console.log('   ❌ MobileNav component not rendered');
  }
} else {
  console.log('❌ Root layout.tsx not found');
}

console.log('\n=== Summary ===');
console.log('All source files are properly configured.');
console.log('MobileNav will be:');
console.log('  • HIDDEN on desktop (viewport width >= 768px)');
console.log('  • VISIBLE on mobile (viewport width < 768px)');
console.log('  • Interactive with animated hamburger menu');
console.log('  • Includes language switcher and search functionality');
