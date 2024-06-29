//notes

// responsive modifiers
// prefers reduced
// start, end, scrub from classes IN PROGRESS, make sure there's a method to parse start and end formats to send strings to scrolltrigger like 'will this turn end-[bottom,top] into end:'bottom top'? I'm not seeing the bracket, comma, space parsing.' Prep all of the values, mise en place.


(function ($) {
    // Check if awp object exists, if not create it
    window.awp = window.awp || {
        docs: [], // Array to store the different docs
        users: [], // Array to store the users

        indexDocs: function () {
            // Clear the docs array
            this.docs = [];

            // Check if FLBuilder is defined
            if (typeof FLBuilder !== 'undefined') {
                // Check if the iFrame UI is enabled
                if (FLBuilder.UIIFrame.isEnabled()) {
                    console.log("iFrame UI is enabled");

                    // Check if the script is executing in the parent window
                    if (FLBuilder.UIIFrame.isUIWindow()) {
                        console.log("Script is executing in the parent window");

                        // Get the iframe's window
                        var win = FLBuilder.UIIFrame.getIFrameWindow();
                        // Add the document of the iframe's window to the docs array
                        this.docs.push(win.document);
                    } else if (FLBuilder.UIIFrame.isIFrameWindow()) {
                        // If the script is executing in the iframe window
                        console.log("Script is executing in the iframe window");

                        // Add the document of the current window to the docs array
                        this.docs.push(window.document);
                    }
                } else {
                    console.log("Legacy UI is enabled");

                    // If the iFrame UI is not enabled, add the document of the current window to the docs array
                    this.docs.push(window.document);
                }
            } else {
                console.log("Outside of the builder");

                // If FLBuilder is not defined, add the document of the current window to the docs array
                this.docs.push(window.document);
            }
        },

        indexUsers: function () {
            var self = this; // Store the context of awp object

            // Clear the users array
            self.users = [];

            // Loop through each item in the docs array
            $.each(self.docs, function (index, doc) {
                // Find all elements with the class of 'awp'
                var users = $(doc).find('.awp');

                // Loop through each user and add it to the users array
                users.each(function () {
                    // Create a new user object with 'element' and 'animation' properties
                    var userObj = {
                        element: this,
                        classes: [],
                        animation: {
                            timelineProperties: []
                        }
                    };

                    // Add the user object to the users array
                    self.users.push(userObj);
                });
            });
        },



        processUsers: function () {
            var self = this;

            // Loop through each user object
            $.each(self.users, function (index, userObj) {
                // Process each class
                self.processClasses(userObj);

                // Set up a GSAP timeline
                self.setupAnimation(userObj);


            });
        },

        indexAnimationEventType: function (userObj) {
            // Default event type
            var eventType = 'scroll';
            var start = "top bottom";
            var end = "bottom top";

            // Check if any of the user's classes start with 'event_', 'start-', or 'end-'
            var specialClasses = userObj.classes.filter(function (className) {
                return className.startsWith('event-') || className.startsWith('start-') || className.startsWith('end-');
            });

            // If special classes were found, extract the event type, start, and end
            specialClasses.forEach(function (specialClass) {
                if (specialClass.startsWith('event-')) {
                    eventType = specialClass.split('_')[1];
                } else if (specialClass.startsWith('start-')) {
                    start = specialClass.split('-')[1];
                } else if (specialClass.startsWith('end-')) {
                    end = specialClass.split('-')[1];
                }

                // Remove the special class from the classes array
                userObj.classes = userObj.classes.filter(function (className) {
                    return className !== specialClass;
                });
            });

            // Store the event type, start, and end in the user object
            userObj.animation.eventType = eventType;
            userObj.animation.start = start;
            userObj.animation.end = end;
        },


        indexUserClasses: function () {
            var self = this;

            // Loop through each user object
            $.each(self.users, function (index, userObj) {
                // Get the class attribute of the user element
                var classes = $(userObj.element).attr('class');

                // Split the classes string into an array
                var classArray = classes.split(' ');

                // Filter the class array to only include classes that match the new pattern
                var animationClasses = classArray.filter(function (className) {
                    return className.includes('-[') && className.includes(']');
                });

                // Store the animation classes array in the user object
                userObj.classes = animationClasses;
            });
        },

        processClasses: function (userObj) {
            // Index the animation event type, start, and end
            this.indexAnimationEventType(userObj);

            // Process the remaining classes
            userObj.classes.forEach((animationClass, index) => {
                let parts = animationClass.split('-['); // split the class name by '-['
                if (parts.length === 2) {
                    let property = parts[0];
                    let values = parts[1].slice(0, -1).split(','); // remove the closing bracket and split by comma

                    if (values.length === 2) {
                        let fromValue = values[0];
                        let toValue = values[1];

                        // Store the results in timelineProperties
                        if (!userObj.animation.timelineProperties) {
                            userObj.animation.timelineProperties = [];
                        }
                        userObj.animation.timelineProperties.push({
                            property: property,
                            fromValue: fromValue,
                            toValue: toValue
                        });
                    }
                }
            });
        },

        setupAnimation: function (userObj) {
            // Create a new GSAP timeline
            var tl = gsap.timeline();

            // Create 'from' and 'to' objects to hold all properties
            var fromProperties = {};
            var toProperties = {};

            // Array of prefixes to omit from the properties object
            var omitPrefixes = ['event_', 'start-', 'end-'];

            // Loop through each timelineProperty in the userObj
            userObj.animation.timelineProperties.forEach(function (timelineProperty) {
                // Check if the property starts with any of the omitPrefixes
                if (!omitPrefixes.some(prefix => timelineProperty.property.startsWith(prefix))) {
                    // Add each property to the 'from' and 'to' objects
                    fromProperties[timelineProperty.property] = timelineProperty.fromValue;
                    toProperties[timelineProperty.property] = timelineProperty.toValue;
                }
            });

            // Set the default ease to none and force a 3D transform
            toProperties.ease = "none";
            toProperties.force3D = true;

            // Create a single fromTo tween with all properties
            tl.fromTo(userObj.element, fromProperties, toProperties);

            // Pause the timeline at the beginning
            tl.pause();

            // Store the timeline in the userObj
            userObj.animation.timeline = tl;

            // Create a ScrollTrigger for the timeline if the event type is 'scroll'
            if (userObj.animation.eventType === 'scroll') {
                userObj.animation.scrollTrigger = ScrollTrigger.create({
                    animation: tl,
                    trigger: userObj.element,
                    start: userObj.animation.start, // use the user-defined start
                    end: userObj.animation.end, // use the user-defined end
                    scrub: true // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
                });
            }
        },

        setupMatchMedia: function (userObj) {
            let mm = gsap.matchMedia();

            mm.add("(max-width: 767px)", () => {
                this.setupMobileAnimations(userObj);
            });

            mm.add("(min-width: 0px)", () => {
                this.setupAllAnimations(userObj);
            });

            mm.add("(min-width: 768px)", () => {
                this.setupTabletPortraitAnimations(userObj);
            });

            mm.add("(min-width: 1024px)", () => {
                this.setupTabletLandscapeAnimations(userObj);
            });

            mm.add("(min-width: 1280px)", () => {
                this.setupLaptopAnimations(userObj);
            });

            mm.add("(min-width: 1536px)", () => {
                this.setupDesktopAnimations(userObj);
            });
        },

        setupAllAnimations: function (userObj) {
            // TODO: Set up animations for all screen sizes
        },

        setupMobileAnimations: function (userObj) {
            // TODO: Set up animations for Mobius
        },

        setupTabletPortraitAnimations: function (userObj) {
            // TODO: Set up animations for tablet portrait
        },

        setupTabletLandscapeAnimations: function (userObj) {
            // TODO: Set up animations for tablet landscape
        },

        setupLaptopAnimations: function (userObj) {
            // TODO: Set up animations for laptop
        },

        setupDesktopAnimations: function (userObj) {
            // TODO: Set up animations for desktop
        },



        sanity: function () {

            gsap.to(".sanity", {
                rotation: 180,
                scrollTrigger: {
                    trigger: ".sanity",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    markers: true
                }
            });
        },


        // init method to call methods in order
        init: function () {
            // Call your methods here in the order you want
            this.indexDocs();
            this.indexUsers();
            this.indexUserClasses();
            this.processUsers();
            this.setupMatchMedia();
            this.sanity();
        },

        refresh: function () {
            // Loop through the users array
            this.users.forEach(function (userObj) {
                // If a timeline exists, kill it and clear props
                if (userObj.animation.timeline) {
                    userObj.animation.timeline.clearProps("all", true);
                    userObj.animation.timeline.kill();
                }

                // If a ScrollTrigger exists, kill it
                if (userObj.animation.scrollTrigger) {
                    userObj.animation.scrollTrigger.kill();
                }
            });

            // Clear the docs and users arrays
            this.docs = [];
            this.users = [];

            // Reinitialize the awp object
            this.init();
        },


    };

    // Call the init method when the script is loaded
    awp.init();
})(jQuery);
