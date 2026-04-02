module ApplicationHelper
  # Mount a React component in a view.
  #
  # Usage:
  #   <%= react_component("Button", variant: "outline") { "Click me" } %>
  #
  # The component must be registered in app/javascript/components/index.js
  def react_component(name, props = {}, &block)
    content = block_given? ? capture(&block) : nil
    props   = props.merge(children: content) if content
    tag.div(
      "",
      data: {
        react_component: name,
        react_props: props.to_json
      }
    )
  end
end
