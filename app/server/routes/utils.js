
module.exports = function () {
    return {
        getFileFromRequest,
        prepareAttachementsDataFromDB
    }

    function prepareAttachementsDataFromDB(row) {
        var result = [];
        
        if (row._attachments) {
            for (fileName in row._attachments) {
                var file = row._attachments[fileName];
                result.push({
                    text: row.text,
                    file: {
                        data: new Buffer(file.data).toString('base64'),
                        contentType: file.content_type
                    },
                    album: row.album
                });
            }
        }
        return result;
    }

    function getFileFromRequest(req, newFile){
        newFile.files = {};

        req.pipe(req.busboy);
        req.busboy.on('field', function(fieldname, val) {
            console.log('Field [' + fieldname + ']: value: ' + val);
            newFile[fieldname] = val;
        });
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log("Uploading: " + filename);
            var fileBuffer = new Buffer('');
            //Path where image will be uploaded
            file.on('data', function(data) {
                console.log('File [' + filename + '] got ' + data.length + ' bytes');
                fileBuffer = Buffer.concat([fileBuffer, data]);
            });

            file.on('end', function() {
                console.log('File [' + filename + '] Finished');
                newFile.files[filename] = {
                    buffer: fileBuffer,
                    type: mimetype,
                    filename: filename
                };
            });
        });
    }

};