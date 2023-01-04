import * as React from 'react';
import styles from './OneFeoHightlights.module.scss';
import { IOneFeoHightlightsProps } from './IOneFeoHightlightsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import { Editor } from '@tinymce/tinymce-react';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { WebPartTitle } from '@pnp/spfx-controls-react';

export default class OneFeoHightlights extends React.Component<IOneFeoHightlightsProps, {}> {

  public handleEditorChange = (e) => {
    var id = e.target.id.split("-")[1];
    console.log("sdsd",id)
    //Save the content in properties 
    this.props.editorSection[id].Content = e.target.getContent();
  }


  public render(): React.ReactElement<IOneFeoHightlightsProps> {
    const that = this;
    if (that.props.displayMode === DisplayMode.Edit) {
      console.log("EditMode");
      return (
        <section>
          <div className="container subsec-margin-sm">
          <WebPartTitle  className={styles.titlehead}
                displayMode={this.props.displayMode}
                title={this.props.title}
                updateProperty={this.props.setTitle} />
          </div>
          <div className="half-bg-grey half-bg-xl-grey">
            <div className="container">
              <div className="row g-0 grey-box-5">
                {  this.props.editorSection.map((itm: any, tabindex: number) => 
                  <div key={itm.Title} className="col-12 col-sm-6 col-md-4 col-xl">
                    <div className="content-box">
                      <Editor id={itm.Title} initialValue={itm.Content}  
                        init={{
                          content_style: "a {color:rgb(0,120,212) !important}",
                          plugins: 'link image table lists media code',
                          menubar: 'edit insert format table lists view',  // skip file
                          height: "240",
                          statusbar: false,
                          toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | numlist bullist | media | code',
                          table_responsive_width: true,
                          init_instance_callback: function (editor) {
                            //console.log("editor", editor);
                            var freeTiny = document.getElementsByClassName('tox-notifications-container');
                            for (var i = 0; i < freeTiny.length; i++) {
                              freeTiny[i]['style'].display = 'none';
                            }
                          },
                          table_default_styles: {
                            'width': '100%',
                            'height': 'auto'
                          },
                          image_advtab: true,
                          style_formats: [
                            {
                              title: 'Headings', items: [
                                { title: 'Heading 1', format: 'h2' },
                                { title: 'Heading 2', format: 'h3' },
                                { title: 'Heading 3', format: 'h4' }
                              ]
                            }]
                        }}
                        onChange={this.handleEditorChange.bind(this)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )
    } else {
      console.log("ViewMode")
      return (
        <section>
          <div className="container subsec-margin-sm">
          <WebPartTitle  className={styles.titlehead}
                displayMode={this.props.displayMode}
                title={this.props.title}
                updateProperty={this.props.setTitle} />
          </div>
          <div className="half-bg-grey half-bg-xl-grey">
            <div className="container">
              <div className="row g-0 grey-box-5">
                { this.props.editorSection.map((itm: any, tabindex: number) => 
                  <div key={itm.Title} className={ ((tabindex + 1) == 1 || (tabindex + 1) == 2) ? "col-12 col-sm-6 col-md-4 col-xl  bg-grey-1 " + (tabindex  == 1 && styles.grytext2) : ((tabindex + 1) == 3 || (tabindex + 1) == 4) ? "col-12 col-sm-6 col-md-4 col-xl  bg-grey-2 " + (tabindex  == 3 && styles.grytext4) : ((tabindex + 1) == 5) && "col-12 col-sm-6 col-md-4 col-xl  bg-grey-3"}>
                    <div className="content-box">
                      <div dangerouslySetInnerHTML={{ __html: itm.Content }}  className={styles.goldtxtstyle} id={itm.Title}/>
                    </div> 
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
}
