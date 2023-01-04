import * as React from 'react';
import { ITileProps } from './ITileProps';
import { sp } from "@pnp/sp";

export class Tile extends React.Component<ITileProps, {}> {
 public async result() {
    const result =  await sp.web.ensureUser(this.props.item.emailaddress).then(
      async (result) => {
        var profile = await sp.profiles.getPropertiesFor(result.data.LoginName).then(data => {     
          return data;
         });
         return profile;
      }
    );
    return result;
  }

  public render(): React.ReactElement<ITileProps> {
    const tileStyle: React.CSSProperties = {};
    if (this.props.height) {
      tileStyle.height = `${this.props.height}px`;
    }
    const data = this.result();
     data.then((dt: any) =>{
      if(dt.PictureUrl != null){
        document.getElementById('profilepic-' + this.props.item.emailaddress)['src'] = 'https://ttponline.sharepoint.com/sites/FEO1/_layouts/15/userphoto.aspx?UserName=' + dt.Email;
      }else{
        document.getElementById('profilepic-' + this.props.item.emailaddress)['src'] = 'https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/images/empty-profile.png';
      }
      document.getElementById('displayname-' + this.props.item.emailaddress).innerText = dt.DisplayName;
    })
    return (
    <div className='col-12 col-sm-6 col-lg-4  col-xl-3 px-sm-30'>
      <div className='dept-contacts-item'>
        <img id={'profilepic-' + this.props.item.emailaddress} className='profilepic' src='' alt='Image'/>
          <div className='contact-name'>
            <h5  id={'displayname-' + this.props.item.emailaddress} className='gold-txt'></h5>
            <p className='mb-0'>{this.props.item.contactpurpose}</p>
          </div>
      </div>
    </div>
    );
  }
}
