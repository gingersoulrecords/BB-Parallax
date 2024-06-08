(function ($) {
    // Ensure the bbpx object exists on the window
    if (!window.bbpx) {
        window.bbpx = {
            rows: [],
            indexRows: function () {
                var self = this; // Reference to bbpx object

                // Find all elements with the class 'bbpx-row'
                var bbpxRowElements = $('.bbpx-row');

                // Add each element to the bbpx.rows array with additional properties
                bbpxRowElements.each(function () {
                    var $flRow = $(this);
                    var $flRowContentWrap = $flRow.find('.fl-row-content-wrap');
                    var backgroundURL = '';
                    var rangeClass = '';

                    if ($flRowContentWrap.length > 0) {
                        // Extract the background URL
                        var bgImage = $flRowContentWrap.css('background-image');
                        if (bgImage && bgImage !== 'none') {
                            // Remove the url() wrapper
                            backgroundURL = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
                        }
                    }

                    // Extract the range class
                    var classList = $flRow.attr('class').split(/\s+/);
                    $.each(classList, function (index, item) {
                        if (item.startsWith('range')) {
                            rangeClass = item;
                            return false; // Break the loop
                        }
                    });

                    // Create the elements object and add it to the row object
                    var rowObject = {
                        elements: {
                            flRow: $flRow,
                            flRowContentWrap: {
                                element: $flRowContentWrap,
                                backgroundURL: backgroundURL
                            },
                            rangeClass: rangeClass
                        }
                    };

                    self.rows.push(rowObject); // Use self instead of this
                });
            },
            createBGElements: function () {
                var self = this; // Reference to bbpx object

                // Loop through each row in bbpx.rows
                $.each(self.rows, function (index, row) {
                    // Create a new div element with class 'bbpx-row-bg' and the background image of the row's .fl-row-content-wrap
                    var $bgElement = $('<div class="bbpx-row-bg"></div>').attr('style', 'background-image: url(' + row.elements.flRowContentWrap.backgroundURL + ')');
                    // Prepend the new element to the row
                    row.elements.flRowContentWrap.element.prepend($bgElement);
                });
            },
            createBGScrollTriggers: function () {
                var self = this; // Reference to bbpx object

                // Loop through each row in bbpx.rows
                $.each(self.rows, function (index, row) {
                    // Extract the range value from the range class
                    var range = parseInt(row.elements.rangeClass.replace('range-', ''));

                    // Calculate the scale factor based on the translation range
                    var scale = 1 + (range * 2) / 100;

                    // GSAP Timeline
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: row.elements.flRow,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        }
                    }).fromTo(row.elements.flRow.find('.bbpx-row-bg'),
                        {
                            yPercent: -range, // Start translating upwards by range%
                            scale: scale,
                            rotation: 0.01, // Trigger hardware acceleration
                            force3D: true // Force the use of 3D transforms
                        },
                        {
                            yPercent: range, // End translating downwards by range%
                            ease: "none", // Make the transition linear
                            rotation: 0.01, // Maintain hardware acceleration
                            force3D: true // Maintain the use of 3D transforms
                        }
                    );
                });
            },
            init: function () {
                this.indexRows();
                this.createBGElements();

                this.createBGScrollTriggers();
            }
        };
    }

    $(document).ready(function () {
        window.bbpx.init();
    });
})(jQuery);
