import { cleanDOM } from 'discourse/lib/clean-dom';
import { startPageTracking, onPageChange } from 'discourse/lib/page-tracker';
import { viewTrackingRequired } from 'discourse/lib/ajax';
import showLockableModal from 'discourse/plugins/content_lockers/discourse/lib/show-lockable-modal';

export default {
  name: "content_lockers",

  initialize(container) {

    if(Discourse.SiteSettings.guest_locker_enabled || Discourse.SiteSettings.social_locker_enabled) {
      var pageViews = 0;
      var topicViews = 0;
      // Tell our AJAX system to track a page transition
      const router = container.lookup('router:main');
      router.on('willTransition', viewTrackingRequired);
      router.on('didTransition', cleanDOM);

      startPageTracking(router);

      onPageChange((url, title) => {
        var showing = false;

        pageViews++;

        if (Discourse.SiteSettings.guest_locker_enabled && !Discourse.User.current()) {
          var topicPattern = new RegExp('^/t/');

          if(topicPattern.test(url)) {
            topicViews++;

            if (topicViews >= Discourse.SiteSettings.guest_locker_topic_views_threshold) {
              showLockableModal('guest-locker');
              showing = true;
            }

          }

        }

        if (Discourse.SiteSettings.social_locker_enabled && !showing) {
          var pageViewsThreshold = Discourse.User.current() ? Discourse.SiteSettings.social_locker_guest_threshold : Discourse.SiteSettings.social_locker_user_threshold;

          if (pageViews % pageViewsThreshold == 1) {
            showLockableModal('social-locker');
            showing = true;
          }

        }

      });
    }

  }
};
