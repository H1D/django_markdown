var upload = false;  
var InlineUpload =   
{  
    dialog: null,  
    block: '',  
    offset: {},  
    options: {  
        container_class: 'markItUpInlineUpload',  
        form_id: 'inline_upload_form',  
        action: '/django-markdown/upload/',
        inputs: {  
            file: { label: 'File', id: 'inline_upload_file1', name: 'inline_upload_file1' }  
        },  
        submit: { id: 'inline_upload_submit', value: 'upload' },
        close: { id: 'inline_upload_close' },
        iframe: 'inline_upload_iframe'  
    },  
    display: function(hash,uploadOption)  
    {     
        if(uploadOption){  
            if( ! jQuery('.markItUpInlineUpload').length)
            {
                var self = this;

            /* Find position of toolbar. The dialog will inserted into the DOM elsewhere
             * but has position: absolute. This is to avoid nesting the upload form inside
             * the original. The dialog's offset from the toolbar position is adjusted in
             * the stylesheet with the margin rule.
             */
            this.offset = jQuery(hash.textarea).prev('.markItUpHeader').offset();

            /* We want to build this fresh each time to avoid ID conflicts in case of
             * multiple editors. This also means the form elements don't need to be
             * cleared out.
             */
            this.dialog = jQuery([
                           '<div class="',
                            this.options.container_class,
                            '"><div><form id="',
                            this.options.form_id,
                            '" action="',
                            this.options.action,
                            '" enctype="multipart/form-data" method="post"><label for="',
                            this.options.inputs.file.id,
                            '">',
                            this.options.inputs.file.label,
                            '</label><input id="',
                            this.options.inputs.file.id,
                            '" name="',
                            this.options.inputs.file.name,
                            '" type="file"><input id="',
                            this.options.submit.id,
                            '" type="button" value="',
                            this.options.submit.value,
                            '"><input id="',
                            this.options.close.id,
                            '" type="button"></form></div></div>',

            ].join(''))
                .appendTo(document.body)
                .hide()
                .css('top', this.offset.top)
                .css('left', this.offset.left);


            //init submit button
            jQuery('#'+this.options.submit.id).click(function()
            {
                if(jQuery('#inline_upload_file1').val() == ''){
                    alert('Please select a file to upload');
                    return false;
                }
                upload = true;
                jQuery.ajaxFileUpload
                (
                    {
                        url:'/django-markdown/upload/',
                        secureuri:false,
                        fileElementId:'inline_upload_file1',
                        dataType: 'json',
                        success: function (data, status)
                        {
                            if(typeof(data.error) != 'undefined')
                            {
                                if(data.error != '')
                                {
                                    alert(data.error);
                                }else
                                {
                                    alert(data.msg);
                                }
                            }

                            var alt = prompt("Alternative text","IMAGE");
                            var title = prompt("Image title","image title");
                            jQuery.markItUp( {replaceWith:'!['+alt+']('+data+' "'+title+'")' })
                            //jQuery(".markItUpInlineUpload").fadeOut().css("zIndex", 11)
                            InlineUpload.dialog.fadeOut().remove();
                        },
                        error: function (data, status, e)
                        {
                            alert(e);
                        }
                    }
                )
                jQuery('#'+self.options.form_id).fadeTo('fast', 0.2);

            });


            // init cancel button
            jQuery('#'+this.options.close.id).click(this.cleanUp);


            // form response will be sent to the iframe

            jQuery('#'+this.options.iframe).bind('load', function()
            {
                var result = document.getElementById(''+self.options.iframe)
                                            .contentWindow.document.body.innerHTML;
                if(upload){
                        jQuery('#resultContainer').html(result);
                        jQuery(".module .products a").click(function() {
                            src = jQuery(this).attr("href");
                            alt = jQuery(this).attr("title");
                            //jQuery.markItUp( {replaceWith:'<img class="[![Class]!]" src="/blog/'+src+'" alt="'+alt+'">' });
                            jQuery.markItUp( {replaceWith:'[img]'+src+'[/img]' });
                            jQuery("#linkPlugin").fadeOut().css("zIndex", 11);
                            return false;
                        });
                        InlineUpload.dialog.fadeOut().remove();

                        jQuery("#linkPlugin").fadeIn().css('top', self.offset.top-80).css('left', self.offset.left+460).css("zIndex", 11);
                        upload = false;
                }
            });

                // Finally, display the dialog
                this.dialog.fadeIn('slow');
                }

        }
    else
        {
        this.offset = jQuery(hash.textarea).prev('.markItUpHeader').offset();  
        jQuery('#resultContainer').load('/django-markdown/upload/','',function(responseText) {
                jQuery(".module .products a").click(function() {
                        alert(responseText)
                        src = jQuery(this).attr("href");  
                        //alt = jQuery(this).attr("title");
                        //jQuery.markItUp( {replaceWith:'<img class="[![Class]!]" src="/blog/'+src+'" alt="'+alt+'">' });  
                        jQuery.markItUp( {replaceWith:'![]('+src+' "")' });
                        jQuery("#linkPlugin").fadeOut().css("zIndex", 11);  
                        return false;  
                    });   
            });  
          
        jQuery("#linkPlugin").fadeIn().css('top', this.offset.top-80).css('left', this.offset.left+460).css("zIndex", 11);  
          
        }  
    },  
    cleanUp: function()  
    {  
        InlineUpload.dialog.fadeOut().remove();  
    }  
}; 
