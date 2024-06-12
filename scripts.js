//notes

//add the elements and the timelines to the bbpx object. they need to be separated as they might be overwriting each other, or the timelines/scrolltriggers might need to be refreshed?


(function ($) {


    // Ensure the bbpx object exists on the window
    if (!window.bbpx) {
        window.bbpx = {
            rows: [],
            modules: [],


            indexRows: function () {
                var self = this; // Reference to bbpx object

                // Find all elements with the class 'bbpx-row'
                var bbpxRowElements = $('.bbpx-row');

                // Add each element to the bbpx.rows array with additional properties
                bbpxRowElements.each(function () {
                    var $flRow = $(this);
                    var $flRowContentWrap = $flRow.find('.fl-row-content-wrap');
                    var rowBackgroundURL = '';
                    var rowAnimationClasses = [];
                    var rangeValue = null;

                    if ($flRowContentWrap.length > 0) {
                        // Extract the background URL
                        var bgImage = $flRowContentWrap.css('background-image');
                        if (bgImage && bgImage !== 'none') {
                            // Remove the url() wrapper
                            rowBackgroundURL = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
                        }
                    }

                    // Extract the animation classes
                    var classList = $flRow.attr('class').split(/\s+/);
                    var bbpxRowIndex = classList.indexOf('bbpx-row');
                    if (bbpxRowIndex !== -1) {
                        // Check the classes adjacent to 'bbpx-row'
                        if (bbpxRowIndex > 0 && !classList[bbpxRowIndex - 1].startsWith('range_')) {
                            var parsedClass = self.parsePropertyClass(classList[bbpxRowIndex - 1]);
                            rowAnimationClasses.push(parsedClass);
                        }
                        if (bbpxRowIndex < classList.length - 1 && !classList[bbpxRowIndex + 1].startsWith('range_')) {
                            var parsedClass = self.parsePropertyClass(classList[bbpxRowIndex + 1]);
                            rowAnimationClasses.push(parsedClass);
                        }
                        if (bbpxRowIndex > 0 && classList[bbpxRowIndex - 1].startsWith('range_')) {
                            rangeValue = parseFloat(classList[bbpxRowIndex - 1].split('_')[1]);
                        }
                        if (bbpxRowIndex < classList.length - 1 && classList[bbpxRowIndex + 1].startsWith('range_')) {
                            rangeValue = parseFloat(classList[bbpxRowIndex + 1].split('_')[1]);
                        }
                    }

                    // Create the elements object and add it to the row object
                    var rowObject = {
                        elements: {
                            flRow: $flRow,
                            flRowContentWrap: {
                                element: $flRowContentWrap,
                                rowBackgroundURL: rowBackgroundURL
                            },
                            animationClasses: rowAnimationClasses,
                            rangeValue: rangeValue
                        }
                    };

                    self.rows.push(rowObject); // Use self instead of this
                });
            },

            createBGScrollTriggers: function () {
                var self = this; // Reference to bbpx object

                // Loop through each row in bbpx.rows
                $.each(self.rows, function (index, row) {
                    // GSAP Timeline
                    timeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: row.elements.flRow,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                            markers: true
                        }
                    });

                    // Store the timeline in the row object
                    row.timeline = timeline;

                    // Get the animated element
                    var $animatedElement = row.elements.flRowContentWrap.element.find('.bbpx-row-bg');

                    // Loop through each animation class
                    $.each(row.elements.animationClasses, function (index, animationClass) {
                        // Add a tween for this animation class
                        var tweenObject = {};
                        tweenObject[animationClass.property] = animationClass.toValue;
                        timeline.fromTo($animatedElement,
                            {
                                [animationClass.property]: animationClass.fromValue
                            },
                            tweenObject
                        );
                    });

                    // If rangeValue exists, add a tween for it
                    if (row.elements.rangeValue !== null) {
                        var range = row.elements.rangeValue;
                        var scale = 1 + (range * 2) / 100;
                        timeline.fromTo($animatedElement,
                            {
                                yPercent: -range,
                                scale: scale,
                                rotation: 0.01,
                                force3D: true
                            },
                            {
                                yPercent: range,
                                ease: "none",
                                rotation: 0.01,
                                force3D: true
                            }
                        );
                    }
                });
            },

            createBGElements: function () {
                var self = this; // Reference to bbpx object

                // Loop through each row in bbpx.rows
                $.each(self.rows, function (index, row) {
                    // Create a new div element with class 'bbpx-row-bg' and the background image of the row's .fl-row-content-wrap
                    var $bgElement = $('<div class="bbpx-row-bg"></div>').attr('style', 'background-image: url(' + row.elements.flRowContentWrap.rowBackgroundURL + ')');
                    // Prepend the new element to the row
                    row.elements.flRowContentWrap.element.prepend($bgElement);
                });
            },

            // indexModules: function () {
            //     var self = this; // Reference to bbpx object

            //     // Find all elements with the class 'bbpx-module'
            //     var bbpxModuleElements = $('.bbpx-module');

            //     // Add each element to the bbpx.modules array with additional properties
            //     bbpxModuleElements.each(function () {
            //         var $flModule = $(this);

            //         var rangeClass = '';

            //         // Extract the range class
            //         var classList = $flModule.attr('class').split(/\s+/);
            //         $.each(classList, function (index, item) {
            //             if (item.startsWith('range')) {
            //                 rangeClass = item;
            //                 return false; // Break the loop
            //             }
            //         });

            //         // Create the elements object and add it to the module object
            //         var moduleObject = {
            //             elements: {
            //                 flModule: $flModule,
            //                 rangeClass: rangeClass
            //             }
            //         };

            //         self.modules.push(moduleObject); // Use self instead of this
            //     });
            // },


            // createModuleScrollTriggers: function () {
            //     var self = this; // Reference to bbpx object



            //     // Iterate over each module
            //     $.each(self.modules, function (index, module) {

            //         // Extract the range value from the range class
            //         var range = parseInt(module.elements.rangeClass.replace('range-', ''));

            //         // Create a ScrollTrigger for each module
            //         gsap.timeline({
            //             scrollTrigger: {
            //                 trigger: module.elements.flModule,
            //                 start: "top bottom",
            //                 end: "bottom top",
            //                 scrub: true,
            //             }
            //         }).fromTo(module.elements.flModule,
            //             {
            //                 yPercent: range, // Start translating upwards by range%
            //                 rotation: 0.01, // Trigger hardware acceleration
            //                 force3D: true // Force the use of 3D transforms
            //             },
            //             {
            //                 yPercent: -range, // End translating downwards by range%
            //                 ease: "none", // Make the transition linear
            //                 rotation: 0.01, // Maintain hardware acceleration
            //                 force3D: true // Maintain the use of 3D transforms
            //             }
            //         );
            //     });
            // },

            // parsePropertyClass: function (propertyClass) {
            //     // Remove the brackets and split the class into parts
            //     var parts = propertyClass.replace(/[\[\]]/g, '').split('-');

            //     // Extract the property, 'from' value, and 'to' value
            //     var property = parts[0];
            //     var fromValue = parseFloat(parts[1]);
            //     var toValue = parseFloat(parts[2]);

            //     // Return the parsed values as an object
            //     return {
            //         property: property,
            //         fromValue: fromValue,
            //         toValue: toValue
            //     };
            // },

            parsePropertyClass: function (propertyClass) {
                // Split the class into parts
                var parts = propertyClass.split('_');

                // Extract the property
                var property = parts[0];

                // Extract the 'from' and 'to' values
                var fromValue = parseFloat(parts[1]);
                var toValue = parseFloat(parts[2]);

                // Return the parsed values as an object
                return {
                    property: property,
                    fromValue: fromValue,
                    toValue: toValue
                };
            },


            indexModules: function () {
                var self = this; // Reference to bbpx object

                // Find all elements with the class 'bbpx-module'
                var bbpxModuleElements = $('.bbpx-module');

                // Add each element to the bbpx.modules array with additional properties
                bbpxModuleElements.each(function () {
                    var $flModule = $(this);
                    var $flCol = $flModule.closest('.fl-col'); // Get the parent .fl-col element
                    var moduleAnimationClasses = [];
                    var rangeValue = null;

                    // Extract the animation classes
                    var classList = $flModule.attr('class').split(/\s+/);
                    var bbpxModuleIndex = classList.indexOf('bbpx-module');
                    if (bbpxModuleIndex !== -1) {
                        // Check the classes adjacent to 'bbpx-module'
                        if (bbpxModuleIndex > 0 && !classList[bbpxModuleIndex - 1].startsWith('range_')) {
                            var parsedClass = self.parsePropertyClass(classList[bbpxModuleIndex - 1]);
                            moduleAnimationClasses.push(parsedClass);
                        }
                        if (bbpxModuleIndex < classList.length - 1 && !classList[bbpxModuleIndex + 1].startsWith('range_')) {
                            var parsedClass = self.parsePropertyClass(classList[bbpxModuleIndex + 1]);
                            moduleAnimationClasses.push(parsedClass);
                        }
                        if (bbpxModuleIndex > 0 && classList[bbpxModuleIndex - 1].startsWith('range_')) {
                            rangeValue = parseFloat(classList[bbpxModuleIndex - 1].split('_')[1]);
                        }
                        if (bbpxModuleIndex < classList.length - 1 && classList[bbpxModuleIndex + 1].startsWith('range_')) {
                            rangeValue = parseFloat(classList[bbpxModuleIndex + 1].split('_')[1]);
                        }
                    }

                    // Create the elements object and add it to the module object
                    var moduleObject = {
                        elements: {
                            flModule: $flModule,
                            flCol: $flCol, // Add the parent .fl-col element to the module object
                            animationClasses: moduleAnimationClasses,
                            rangeValue: rangeValue
                        }
                    };

                    self.modules.push(moduleObject); // Use self instead of this
                });
            },

            createModuleScrollTriggers: function () {
                var self = this; // Reference to bbpx object

                // Iterate over each module
                $.each(self.modules, function (index, module) {
                    // GSAP Timeline
                    var timeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: module.elements.flCol, // Use the parent .fl-col element as the trigger
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                            markers: true
                        }
                    });

                    // Loop through each animation class
                    $.each(module.elements.animationClasses, function (index, animationClass) {
                        // Add a tween for this animation class
                        var tweenObject = {};
                        tweenObject[animationClass.property] = animationClass.toValue;
                        timeline.fromTo(module.elements.flModule,
                            {
                                [animationClass.property]: animationClass.fromValue
                            },
                            tweenObject
                        );
                    });

                    // If rangeValue exists, add a tween for it
                    if (module.elements.rangeValue !== null) {
                        var range = module.elements.rangeValue;
                        //var scale = 1 + (range * 2) / 100;
                        timeline.fromTo(module.elements.flModule,
                            {
                                yPercent: -range,
                                //scale: scale,
                                rotation: 0.01,
                                force3D: true
                            },
                            {
                                yPercent: range,
                                ease: "none",
                                rotation: 0.01,
                                force3D: true
                            }
                        );
                    }
                });
            },

            init: function () {
                this.indexRows();
                this.indexModules();
                this.createBGElements();




                this.createModuleScrollTriggers();
                this.createBGScrollTriggers();
            }
        };
    }



    //document ready
    // $(function () {
    //     gsap.to(".fl-photo", {
    //         rotation: 360,
    //         scrollTrigger: {
    //             trigger: ".fl-photo",
    //             start: "top bottom",
    //             end: "bottom top",
    //             scrub: true,
    //             markers: true
    //         }
    //     });
    // });

    $(window).on('load', function () {
        window.bbpx.init();
    });
})(jQuery);
