# https://github.com/Jems22/fastlane-plugin-increment_version_code/blob/master/lib/fastlane/plugin/increment_version_code/actions/increment_version_code_action.rb
# Modified for versionName

require 'tempfile'
require 'fileutils'

module Fastlane
  module Actions
    class IncrementVersionNameAction < Action
      def self.run(params)

        version_name = "0"
        new_version_name ||= params[:version_name]

        constant_name ||= params[:ext_constant_name]

        gradle_file_path ||= params[:gradle_file_path]
        if gradle_file_path != nil
            UI.message("The increment_version_name plugin will use gradle file at (#{gradle_file_path})!")
            new_version_name = incrementVersion(gradle_file_path, new_version_name, constant_name)
        else
            app_folder_name ||= params[:app_folder_name]
            UI.message("The get_version_name plugin is looking inside your project folder (#{app_folder_name})!")

            #temp_file = Tempfile.new('fastlaneIncrementVersionname')
            #foundVersionName = "false"
            Dir.glob("**/#{app_folder_name}/build.gradle") do |path|
                UI.message(" -> Found a build.gradle file at path: (#{path})!")
                new_version_name = incrementVersion(path, new_version_name, constant_name)
            end

        end

        if new_version_name == nil
            UI.user_error!("Impossible to find the version name with the specified properties 😭")
        else
            # Store the version name in the shared hash
            Actions.lane_context["VERSION_NAME"]=new_version_name
            UI.success("☝️ Version name has been changed to #{new_version_name}")
        end

        return new_version_name
      end

      def self.incrementVersion(path, new_version_name, constant_name)
          if !File.file?(path)
              UI.message(" -> No file exist at path: (#{path})!")
              return -1
          end
          begin
              foundVersionName = "false"
              temp_file = Tempfile.new('fastlaneIncrementVersionName')
              File.open(path, 'r') do |file|
                  file.each_line do |line|
                      if line.include? constant_name and foundVersionName=="false"
                          UI.message(" -> line: (#{line})!")
                        versionComponents = line.strip.split(' "')
                        version_name = versionComponents[versionComponents.length-1].tr("\"","")
                        line.replace line.sub(version_name, new_version_name)
                        foundVersionName = "true"
                        temp_file.puts line
                      else
                      temp_file.puts line
                   end
              end
              file.close
            end
            temp_file.rewind
            temp_file.close
            FileUtils.mv(temp_file.path, path)
            temp_file.unlink
          end
          if foundVersionName == "true"
              return new_version_name
          end
          return -1
      end

      def self.description
        "Increment the version name of your android project."
      end

      def self.authors
        ["Jems"]
      end

      def self.available_options
          [
              FastlaneCore::ConfigItem.new(key: :app_folder_name,
                                      env_name: "INCREMENTVERSIONNAME_APP_FOLDER_NAME",
                                   description: "The name of the application source folder in the Android project (default: app)",
                                      optional: true,
                                          type: String,
                                 default_value:"app"),
             FastlaneCore::ConfigItem.new(key: :gradle_file_path,
                                     env_name: "INCREMENTVERSIONNAME_GRADLE_FILE_PATH",
                                  description: "The relative path to the gradle file containing the version name parameter (default:app/build.gradle)",
                                     optional: true,
                                         type: String,
                                default_value: nil),
              FastlaneCore::ConfigItem.new(key: :version_name,
                                      env_name: "INCREMENTVERSIONNAME_VERSION_NAME",
                                   description: "Change to a specific version (optional)",
                                      optional: true,
                                          type: String,
                                 default_value: nil),
              FastlaneCore::ConfigItem.new(key: :ext_constant_name,
                                      env_name: "INCREMENTVERSIONNAME_EXT_CONSTANT_NAME",
                                   description: "If the version name is set in an ext constant, specify the constant name (optional)",
                                      optional: true,
                                          type: String,
                                 default_value: "versionName")
          ]
      end

      def self.output
        [
          ['VERSION_NAME', 'The new version name of the project']
        ]
      end

      def self.is_supported?(platform)
        [:android].include?(platform)
      end
    end
  end
end
