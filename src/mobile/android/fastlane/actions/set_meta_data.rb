# https://github.com/MaximusMcCann/fastlane-plugin-android_change_app_name/blob/master/lib/fastlane/plugin/android_change_app_name/actions/android_change_app_name_action.rb
# Modified to update metadata in AndroidManifest.xml

module Fastlane
  module Actions
    class SetMetaDataAction < Action
      def self.run(params)
        require 'nokogiri'

        attribute = params[:attribute]
        value = params[:value]
        manifest = params[:manifest]


        doc = File.open(manifest) { |f|
          @doc = Nokogiri::XML(f)

          @doc.css("meta-data").each do |node|
            if node.values.include? attribute
              node["android:value"] = value
              UI.message("Updated #{attribute}")
            else
              # UI.message("Attribute #{attribute} does not exist in this node")
            end
          end

          File.write(manifest, @doc.to_xml)
        }

      end

      def self.description
        "Changes a manifest attribute"
      end

      def self.authors
        ["rajivshah3"]
      end

      def self.return_value
        # If your method provides a return value, you can describe here what it does
      end

      def self.details
        "Changes a manifest attribute"
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(key: :attribute,
                                  env_name: "",
                                  description: "The attribute to change the value for",
                                  optional: false,
                                  type: String),
          FastlaneCore::ConfigItem.new(key: :value,
                                  env_name: "",
                               description: "The new value for the attribute",
                                  optional: false,
                                      type: String),
          FastlaneCore::ConfigItem.new(key: :manifest,
                                  env_name: "",
                               description: "Optional custom location for AndroidManifest.xml",
                                  optional: false,
                                      type: String,
                             default_value: "app/src/main/AndroidManifest.xml")
        ]
      end
      def self.is_supported?(platform)
        platform == :android
      end
    end
  end
end
