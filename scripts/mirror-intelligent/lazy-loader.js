/**
 * Lazy Loader Module
 * Aggressively triggers lazy loading on pages
 */

const { log, CONFIG } = require('./utils');

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      scrollSteps: options.scrollSteps || CONFIG.SCROLL_STEPS,
      scrollDelay: options.scrollDelay || CONFIG.SCROLL_DELAY,
      triggerIntersectionObserver: options.triggerIntersectionObserver !== false,
      triggerNativeLazyLoad: options.triggerNativeLazyLoad !== false,
      waitForImages: options.waitForImages !== false,
      ...options
    };
    this.stats = {
      scrollsPerformed: 0,
      imagesTriggered: 0,
      errors: []
    };
  }

  /**
   * Trigger lazy loading on a page
   */
  async trigger(page) {
    log('INFO', 'Triggering lazy loading...');
    
    try {
      // Get page dimensions
      const dimensions = await page.evaluate(() => ({
        scrollHeight: document.body.scrollHeight,
        clientHeight: window.innerHeight,
        scrollWidth: document.body.scrollWidth,
        clientWidth: window.innerWidth
      }));
      
      log('DEBUG', `Page dimensions: ${JSON.stringify(dimensions)}`);
      
      // Method 1: Aggressive scrolling
      await this.scrollPage(page, dimensions);
      
      // Method 2: Trigger Intersection Observer manually
      if (this.options.triggerIntersectionObserver) {
        await this.triggerIntersectionObserver(page);
      }
      
      // Method 3: Trigger native lazy loading
      if (this.options.triggerNativeLazyLoad) {
        await this.triggerNativeLazyLoad(page);
      }
      
      // Method 4: Force image loading via src/srcset manipulation
      await this.forceImageLoading(page);
      
      // Method 5: Trigger data-src images (common lazy load pattern)
      await this.triggerDataSrcImages(page);
      
      // Method 6: Trigger background images
      await this.triggerBackgroundImages(page);
      
      // Method 7: Wait for all images to load
      if (this.options.waitForImages) {
        await this.waitForImages(page);
      }
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      
      log('INFO', `Lazy loading complete. Scrolled ${this.stats.scrollsPerformed} times.`);
      
    } catch (error) {
      log('ERROR', `Error during lazy loading: ${error.message}`);
      this.stats.errors.push({ phase: 'trigger', error: error.message });
    }
    
    return this.stats;
  }

  /**
   * Scroll through the page in increments
   */
  async scrollPage(page, dimensions) {
    const { scrollHeight, clientHeight } = dimensions;
    const stepSize = Math.ceil(scrollHeight / this.options.scrollSteps);
    
    log('INFO', `Scrolling page (${this.options.scrollSteps} steps, ${stepSize}px each)...`);
    
    for (let i = 0; i <= this.options.scrollSteps; i++) {
      const scrollY = Math.min(i * stepSize, scrollHeight - clientHeight);
      
      await page.evaluate(y => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(this.options.scrollDelay);
      
      this.stats.scrollsPerformed++;
      
      // Log progress
      if (i % 5 === 0 || i === this.options.scrollSteps) {
        const progress = Math.round((i / this.options.scrollSteps) * 100);
        log('DEBUG', `  Scroll progress: ${progress}%`);
      }
      
      // Trigger any lazy loaded elements in viewport
      await this.triggerViewportElements(page);
    }
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(this.options.scrollDelay);
  }

  /**
   * Trigger elements within current viewport
   */
  async triggerViewportElements(page) {
    try {
      await page.evaluate(() => {
        // Find all elements that might be lazy loaded
        const lazyElements = document.querySelectorAll([
          'img[loading="lazy"]',
          'img[data-src]',
          'img[data-srcset]',
          'source[data-srcset]',
          '[data-background-image]',
          '[data-bg]',
          '.lazy',
          '.lazyload',
          '[class*="lazy"]'
        ].join(', '));
        
        lazyElements.forEach(el => {
          // Force loading by scrolling element into view
          el.scrollIntoView({ behavior: 'instant', block: 'center' });
        });
      });
    } catch (error) {
      log('DEBUG', `Error triggering viewport elements: ${error.message}`);
    }
  }

  /**
   * Manually trigger Intersection Observer callbacks
   */
  async triggerIntersectionObserver(page) {
    log('INFO', 'Triggering Intersection Observer callbacks...');
    
    try {
      const triggered = await page.evaluate(() => {
        let count = 0;
        
        // Override IntersectionObserver to immediately trigger callbacks
        const OriginalIntersectionObserver = window.IntersectionObserver;
        
        window.IntersectionObserver = function(callback, options) {
          const observer = new OriginalIntersectionObserver(callback, options);
          
          // Override observe to immediately trigger
          const originalObserve = observer.observe.bind(observer);
          observer.observe = function(target) {
            // Immediately trigger callback as if element is intersecting
            callback([{
              target,
              isIntersecting: true,
              intersectionRatio: 1,
              boundingClientRect: target.getBoundingClientRect(),
              intersectionRect: target.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now()
            }], observer);
            
            return originalObserve(target);
          };
          
          return observer;
        };
        
        // Trigger for all existing observed elements
        if (window.__observedElements) {
          window.__observedElements.forEach(({ target, callback }) => {
            callback([{
              target,
              isIntersecting: true,
              intersectionRatio: 1
            }]);
            count++;
          });
        }
        
        return count;
      });
      
      log('DEBUG', `Triggered ${triggered} Intersection Observer callbacks`);
      
    } catch (error) {
      log('DEBUG', `Error triggering Intersection Observer: ${error.message}`);
    }
  }

  /**
   * Trigger native lazy loading (loading="lazy")
   */
  async triggerNativeLazyLoad(page) {
    log('INFO', 'Triggering native lazy loading...');
    
    try {
      const count = await page.evaluate(() => {
        // Find all lazy-loaded images and iframes
        const lazyElements = document.querySelectorAll('[loading="lazy"]');
        
        lazyElements.forEach(el => {
          // Remove lazy loading attribute to force immediate load
          el.removeAttribute('loading');
          
          // Trigger load by accessing the element
          const src = el.src;
          if (src && !src.startsWith('data:')) {
            el.src = src;
          }
        });
        
        return lazyElements.length;
      });
      
      log('DEBUG', `Triggered ${count} native lazy-load elements`);
      this.stats.imagesTriggered += count;
      
    } catch (error) {
      log('DEBUG', `Error triggering native lazy load: ${error.message}`);
    }
  }

  /**
   * Force image loading by manipulating src/srcset
   */
  async forceImageLoading(page) {
    log('INFO', 'Forcing image loading...');
    
    try {
      const count = await page.evaluate(() => {
        let loaded = 0;
        
        // Handle picture elements with source
        const pictureSources = document.querySelectorAll('source[data-srcset]');
        pictureSources.forEach(source => {
          const srcset = source.getAttribute('data-srcset');
          if (srcset) {
            source.setAttribute('srcset', srcset);
            source.removeAttribute('data-srcset');
            loaded++;
          }
        });
        
        // Handle images with data-src
        const dataSrcImages = document.querySelectorAll('img[data-src]');
        dataSrcImages.forEach(img => {
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            loaded++;
          }
        });
        
        // Handle images with data-srcset
        const dataSrcsetImages = document.querySelectorAll('img[data-srcset]');
        dataSrcsetImages.forEach(img => {
          const srcset = img.getAttribute('data-srcset');
          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
            loaded++;
          }
        });
        
        return loaded;
      });
      
      log('DEBUG', `Forced loading for ${count} images`);
      this.stats.imagesTriggered += count;
      
    } catch (error) {
      log('DEBUG', `Error forcing image loading: ${error.message}`);
    }
  }

  /**
   * Trigger data-src images (common lazy load pattern)
   */
  async triggerDataSrcImages(page) {
    log('INFO', 'Triggering data-src images...');
    
    try {
      // Wait for any images that might be loading
      await page.waitForTimeout(1000);
      
      // Trigger scroll events on lazy load containers
      await page.evaluate(() => {
        // Common lazy load container selectors
        const containers = document.querySelectorAll([
          '.w-dyn-list',
          '.w-dyn-items',
          '.collection-list',
          '.lazy-wrapper',
          '[data-w-id]'
        ].join(', '));
        
        containers.forEach(container => {
          // Dispatch scroll event
          container.dispatchEvent(new Event('scroll'));
          
          // Trigger any associated lazy load
          const event = new CustomEvent('lazyload', { bubbles: true });
          container.dispatchEvent(event);
        });
      });
      
    } catch (error) {
      log('DEBUG', `Error triggering data-src images: ${error.message}`);
    }
  }

  /**
   * Trigger background images
   */
  async triggerBackgroundImages(page) {
    log('INFO', 'Triggering background images...');
    
    try {
      const count = await page.evaluate(() => {
        let triggered = 0;
        
        // Find elements with data-background-image
        const bgElements = document.querySelectorAll('[data-background-image]');
        bgElements.forEach(el => {
          const bgUrl = el.getAttribute('data-background-image');
          if (bgUrl) {
            el.style.backgroundImage = `url(${bgUrl})`;
            triggered++;
          }
        });
        
        // Find elements with data-bg
        const bgDataElements = document.querySelectorAll('[data-bg]');
        bgDataElements.forEach(el => {
          const bgUrl = el.getAttribute('data-bg');
          if (bgUrl) {
            el.style.backgroundImage = `url(${bgUrl})`;
            triggered++;
          }
        });
        
        // Force computed style recalculation
        document.body.offsetHeight;
        
        return triggered;
      });
      
      log('DEBUG', `Triggered ${count} background images`);
      
    } catch (error) {
      log('DEBUG', `Error triggering background images: ${error.message}`);
    }
  }

  /**
   * Wait for all images to finish loading
   */
  async waitForImages(page) {
    log('INFO', 'Waiting for images to load...');
    
    try {
      // Wait for all img elements to be loaded
      await page.waitForFunction(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => img.complete);
      }, { timeout: 10000 });
      
      // Additional wait for any background images
      await page.waitForTimeout(1000);
      
      log('DEBUG', 'All images loaded');
      
    } catch (error) {
      log('DEBUG', `Timeout waiting for images: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  reset() {
    this.stats = {
      scrollsPerformed: 0,
      imagesTriggered: 0,
      errors: []
    };
  }
}

module.exports = { LazyLoader };
